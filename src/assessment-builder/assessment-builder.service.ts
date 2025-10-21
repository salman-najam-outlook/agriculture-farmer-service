import { Inject, Injectable } from "@nestjs/common";
import {
  CreateAssessmentInput,
  GetAllAssessmentListInput,
} from "./dto/create-assessment-builder.input";
import { UpdateAssessmentInput } from "./dto/update-assessment-builder.input";
import { InjectModel } from "@nestjs/sequelize";
import { Assessment } from "./entities/assessment.entity";
import { AssessmentSelectedUser } from "./entities/assessment-users.entity";
import { AssessmentSetting } from "./entities/assessment-setting.entity";
import { Sequelize } from "sequelize-typescript";
import { AssessmentType } from "./dto/AssessmentType";
import { Op } from "sequelize";
import * as moment from "moment";
import { MultiStepAssessmentType } from "./dto/MultiStepAssessmentType";
import { AssessmentStatus } from "./dto/AssessmentStatus";
import { AssessmentQuestions } from "./entities/assessment-questions.entity";
import { AssessmentQuestionHeading } from "./entities/assessment-question-headings.entity";
import { AssessmentQuestionOptions } from "./entities/assessment-question-options.entity";
import { AssessmentOptionsAndSubQuestionsMapping } from "./entities/assessments-options-and-sub-questions-mapping.entity";
import { SurveyStatus } from "./entities/assessment-survey.entity";
import { Farm } from "src/farms/entities/farm.entity";
import { AssessmentResponse } from "./entities/assessment-response.entity";
import { DueDiligenceProductionPlace } from "src/due-diligence/production-place/entities/production-place.entity";
import { UserDDS } from "src/users/entities/dds_user.entity";
import { URL } from "src/config/constant";
import { ApiCallHelper } from "src/helpers/api-call.helper";
import { RequestMethod } from "src/helpers/helper.interfaces";
import { AssessmentSummary } from "./entities/assessment-summary.entity";
@Injectable()
export class AssessmentBuilderService {
  constructor(
    @Inject("SEQUELIZE")
    private readonly sequelize: Sequelize,
    @InjectModel(Assessment)
    private readonly assessmentModel: typeof Assessment,
    @InjectModel(AssessmentSelectedUser)
    private readonly assessmentSelectedUserModel: typeof AssessmentSelectedUser,
    @InjectModel(AssessmentSetting)
    private readonly assessmentSettingModel: typeof AssessmentSetting,
    @InjectModel(AssessmentQuestions)
    private readonly assessmentQuestionModel: typeof AssessmentQuestions,

    @InjectModel(AssessmentQuestionHeading)
    private readonly assessmentQuestionHeading: typeof AssessmentQuestionHeading,

    @InjectModel(AssessmentQuestionOptions)
    private readonly assessmentQuestionOptionsModel: typeof AssessmentQuestionOptions,

    @InjectModel(AssessmentOptionsAndSubQuestionsMapping)
    private readonly optionAndQuestionMappingModel: typeof AssessmentOptionsAndSubQuestionsMapping,

    private apiCallHelper: ApiCallHelper
  ) {}
  async create(
    createAssessmentBuilderInput: CreateAssessmentInput,
    authorization?: string,
    organizationId?: number,
    subOrganizationId?: number
  ) {
    let t = await this.sequelize.transaction();

    try {
      const {
        orgId,
        userId,
        title,
        countries,
        description,
        status,
        assessmentSettings,
        isApplicableToSelectedUsersOnly,
        assessmentSelectedUsers,
      } = createAssessmentBuilderInput;

      const assessment = await this.assessmentModel.create(
        {
          orgId:organizationId,
          subOrganizationId: subOrganizationId,
          userId,
          title,
          countries,
          description,
          status,
          isApplicableToSelectedUsersOnly,
          noOfQuestions: 0,
          noOfResponse: 0,
          assessmentType: AssessmentType.USER_CUSTOM,
        },
        {
          transaction: t,
        }
      );
      const {
        allowMultipleEntries,
        expiryDate,
        isMultiStep,
        isScheduled,
        multiStepType,
        // noOfHeadings,
        noOfQuestion,
        scheduleDate,
        scheduledEndDate,
      } = assessmentSettings;

      if (isMultiStep) {
        if (!multiStepType) {
          throw new Error(
            `Multi-step type should be one of 'HEADINGS' or 'QUESTIONS'`
          );
        }
      }

      if (isScheduled && !scheduleDate) {
        throw new Error(`Schedule Date is required.`);
      }
      const assessmentSettingPayload = {
        allowMultipleEntries,
        expiryDate: expiryDate ? moment(expiryDate).format("YYYY-MM-DD") : "",
        isMultiStep,
        multiStepType,
        // noOfHeadings,
        noOfQuestion,
        isScheduled,
        scheduleDate: isScheduled
        ? scheduleDate
          ? moment(scheduleDate).add(1,"days").format("YYYY-MM-DD")
          : moment(new Date()).format("YYYY-MM-DD")
        : null,
        scheduledEndDate: isScheduled
        ? scheduledEndDate
          ? moment(scheduledEndDate).add(1,"days").format("YYYY-MM-DD")
          : moment(new Date()).format("YYYY-MM-DD")
        : null,
        assessmentId: assessment.id,
        expiryPeriod: expiryDate ? moment.utc(expiryDate).startOf('day').valueOf() - moment.utc().startOf('day').valueOf() : 0,
      };

      if (multiStepType) {
        if (multiStepType === MultiStepAssessmentType.HEADINGS) {
          assessmentSettingPayload.noOfQuestion = 0;
        } else if (multiStepType === MultiStepAssessmentType.QUESTIONS) {
          // assessmentSettingPayload.noOfHeadings = 0;
        }
      }

      await this.assessmentSettingModel.create(assessmentSettingPayload, {
        transaction: t,
      });

      if (isApplicableToSelectedUsersOnly) {
        const selectedUserAssessment = assessmentSelectedUsers.map(
          (selectedUserId) => {
            return {
              assessmentId: assessment.id,
              userId: selectedUserId,
            };
          }
        );
        await this.assessmentSelectedUserModel.bulkCreate(
          selectedUserAssessment,
          {
            transaction: t,
          }
        );
        if (authorization && status === AssessmentStatus.ACTIVE) {
          await this.sendPushNotificationToUsers(
            assessment.title,
            assessment.id,
            assessmentSelectedUsers,
            authorization
          );
        }
      }

      await t.commit();
      return this.findOne(assessment.id);
    } catch (err) {
      console.log(err);
      await t.rollback();
      throw new Error(err.message);
    }
  }

  private async sendPushNotificationToUsers(
    assessmentTitle: string,
    assessmentId: number,
    userIds: number[],
    authorization: string
  ) {
    try {
      const notificationData = {
        title: "Request for Farm Risk Assessment",
        type: "assessment",
        notify: "user",
        message: `You have been requested to submit ${assessmentTitle} Assessment for EUDR Due Diligence. `,
        users: userIds, // List of user IDs
        assessmentId: assessmentId
      };

      const endpoint = `${URL.CF_BASEURL}/admin/notification/assessment`; // Adjust this URL as needed

      // Make API call to send notifications
      const { data } = await this.apiCallHelper.call(
        RequestMethod.POST,
        endpoint,
        {
          "oauth-token": authorization,
        },
        notificationData
      );
      return data;
    } catch (error) {
      console.error("Error sending push notifications:", error);
    }
  }

  async createFromDefaultAssessment(
    userId: number,
    orgId: number,
    defaultAssessmentIds: number[],
    organizationId?: number,    
    subOrganizationId?: number
  ) {
    const existingAssessments = await this.assessmentModel.findAll({
      where: {
        id: {
          [Op.in]: defaultAssessmentIds,
        },
        assessmentType: AssessmentType.DEFAULT_DIMITRA,
        isDeleted: false,
      },
      include: [
        {
          attributes: [
            "id",
            "assessmentId",
            "expiryDate",
            "isScheduled",
            "scheduleDate",
            "scheduledEndDate",
            "isMultiStep",
            "multiStepType",
            "noOfQuestion",
            // "noOfHeadings",
            "allowMultipleEntries",
          ],
          model: AssessmentSetting,
          as: "assessmentSettings",
        },
        {
          model: AssessmentSelectedUser,
          as: "assessmentSelectedUsers",
        },
      ],
    });
    if (existingAssessments.length !== defaultAssessmentIds.length) {
      throw new Error("Dimitra Assessment not found.");
    }
    const savedAssessments = [];
    let t = await this.sequelize.transaction();
    try {
      for (const assessment of existingAssessments) {
        const savedAssessment = await this.assessmentModel.create(
          {
            orgId: organizationId,
            subOrganizationId: subOrganizationId,
            userId: userId,
            title: assessment.title,
            country: assessment.countries,
            description: assessment.description,
            status: AssessmentStatus.IN_ACTIVE,
            isApplicableToSelectedUsersOnly:
              assessment.isApplicableToSelectedUsersOnly,
            noOfQuestions: 0,
            noOfResponse: 0,
            assessmentType: AssessmentType.USER_CUSTOM,
          },
          {
            transaction: t,
          }
        );
        const { assessmentSettings } = assessment;

      const savedSetting =   await this.assessmentSettingModel.create(
          {
            assessmentId: savedAssessment.id,
            allowMultipleEntries:
              assessmentSettings?.allowMultipleEntries || null,
            expiryDate: assessmentSettings?.expiryDate || "",
            isMultiStep: assessmentSettings?.isMultiStep || false,
            multiStepType: assessmentSettings?.multiStepType || MultiStepAssessmentType.QUESTIONS,
            // noOfHeadings: assessmentSettings.noOfHeadings,
            noOfQuestion: assessmentSettings?.noOfQuestion,
            isScheduled: assessmentSettings?.isScheduled,
            scheduleDate: assessmentSettings?.scheduleDate || "",
            scheduledEndDate: assessmentSettings?.scheduledEndDate || "",
          },
          {
            transaction: t,
          }
        );

        const headingType = savedSetting.multiStepType;

        if(headingType === MultiStepAssessmentType.HEADINGS){
              const existingHeadings = await this.assessmentQuestionHeading.findAll({
                where:{
                  assessmentId: assessment.id
            }
              });
          for (let i = 0; i < existingHeadings.length; i++) {
            const element = existingHeadings[i];
            const savedHeading = await this.assessmentQuestionHeading.create({
              assessmentId: savedAssessment.id,
              title: element.title,
              order: element.order,
            });
            const allQUestions = await this.assessmentQuestionModel.findAll({
                  where:{
                headingId: element.id,
                assessmentId: assessment.id,
                parentQuestionId: null,
                  }
            });
            for (let j = 0; j < allQUestions.length; j++) {
              const question = allQUestions[j];
              const savedQuestion = await this.assessmentQuestionModel.create({
                headingId: savedHeading.id,
                assessmentId: savedAssessment.id,
                parentQuestionId: null,
                order:question.order,
                userId:question.userId,
                title:question.title,
                assessmentQuestionType:question.assessmentQuestionType,
                isMandatory:question.isMandatory,
                isEnabled:question.isEnabled,
                hasOptions:question.hasOptions,
                isFileType:question.isFileType,
                fileTypeAdditionalSettings:question.fileTypeAdditionalSettings,
                isDigitalSignatureType:question.isDigitalSignatureType,
                digitalSignatureTypeAdditionalSettings:question.digitalSignatureTypeAdditionalSettings,
              });
                  const options = await this.assessmentQuestionOptionsModel.findAll({
                    where:{
                      assessmentQuestionId: question.id
                }
                  })
              for (let k = 0; k < options.length; k++) {
                const option = options[k];
                await this.assessmentQuestionOptionsModel.create({
                  assessmentQuestionId: savedQuestion.id,
                  label: option.label,
                  value: option.value,
                      checklists:option.checklists
                });
                    
              }
            }
          }
        }
        else{
          const allQUestions = await this.assessmentQuestionModel.findAll({
            where:{
              assessmentId: assessment.id,
              parentQuestionId: null,
            }
          });

          for (let j = 0; j < allQUestions.length; j++) {
            const question = allQUestions[j];
            const savedQuestion = await this.assessmentQuestionModel.create({
              headingId: null,
              assessmentId: savedAssessment.id,
              parentQuestionId: null,
                order:question.order,
                userId:question.userId,
                title:question.title,
                assessmentQuestionType:question.assessmentQuestionType,
                isMandatory:question.isMandatory,
                isEnabled:question.isEnabled,
                hasOptions:question.hasOptions,
                isFileType:question.isFileType,
                fileTypeAdditionalSettings:question.fileTypeAdditionalSettings,
                isDigitalSignatureType:question.isDigitalSignatureType,
                digitalSignatureTypeAdditionalSettings:question.digitalSignatureTypeAdditionalSettings,
            });
            const options = await this.assessmentQuestionOptionsModel.findAll({
              where:{
                assessmentQuestionId: question.id
              }
            })
            for (let k = 0; k < options.length; k++) {
              const option = options[k];
              await this.assessmentQuestionOptionsModel.create({
                assessmentQuestionId: savedQuestion.id,
                label: option.label,
                value: option.value,
                checklists:option.checklists
              });
            }
          }
        }

        savedAssessments.push(savedAssessment);


      }

      

      await t.commit();
      return savedAssessments;
    } catch (err) {
      console.log(err);
      await t.rollback();
      throw new Error(err.message);
    }
  }

  async findAll(
    getAllAssessmentListInput: GetAllAssessmentListInput,
    paginationQuery: {
      offset?: number;
      limit?: number;
    } = {}
  ) {
    let {
      search,
      countries,
      assessmentType = AssessmentType.USER_CUSTOM,
      orgId,
      status,
      userId,
      sortOrder= 'DESC',
      sortColumn = 'id'
    } = getAllAssessmentListInput;

    let where: any = {
      isDeleted: false,
    };

    if (orgId) {
      where.orgId = orgId;
    }
    // if (userId) {
    //   where.userId = {
    //     [Op.or]: [userId, null],
    //   }
    // }
    if (countries && countries.length) {
      where[Op.or] = countries.map(country => ({
        [Op.and]: [
          Sequelize.literal(`JSON_CONTAINS(countries, '["${country}"]')`)
        ]
      }));
    }

    if (assessmentType) {
      where.assessmentType = assessmentType;
    }
    if (status) {
      where.status = status;
    }
    if (search) {
      where = {
        ...where,
        [Op.or]: [
          {
            title: { [Op.like]: `%${search}%` },
          },
          {
            description: { [Op.like]: `%${search}%` },
          },
          {
            noOfQuestions: { [Op.like]: `%${search}%` },
          },
          {
            noOfResponse: { [Op.like]: `%${search}%` },
          },
        ],
      };
    }
    return await this.assessmentModel.findAndCountAll({
      where: where,
      order: [[sortColumn || 'id', sortOrder || 'DESC']],
      attributes: [
        "id",
        "title",
        "description",
        "noOfQuestions",
        "noOfResponse",
        "status",
        "countries",
        "isApplicableToSelectedUsersOnly",
        "isDefault",
      ],
      include: [
        {
          model: AssessmentQuestions,
          as: 'assessmentQuestions'
        },
        {
          model: AssessmentQuestionHeading,
          as: 'assessmentQuestionHeading'
        },
        {
          attributes: [
            "id",
            "assessmentId",
            "expiryDate",
            "isScheduled",
            "scheduleDate",
            "scheduledEndDate",
            "isMultiStep",
            "multiStepType",
            "noOfQuestion",
            // "noOfHeadings",
            "allowMultipleEntries",
          ],
          model: AssessmentSetting,
          as: "assessmentSettings",
        },
        {
          model: AssessmentSelectedUser,
          as: "assessmentSelectedUsers",
        },
      ],
      ...paginationQuery,
      group: ["id"],
      distinct: true,
    });
  }

  async findAllAssessmentList(
    getAllAssessmentListInput: GetAllAssessmentListInput,
    organizationId?: number,
    subOrganizationId?: number
  ) {
    let { page = 1, limit = 100000 } = getAllAssessmentListInput;

    let where: any = {
      org_id: organizationId,
    };

    if(subOrganizationId){
      where.subOrganizationId = subOrganizationId ? parseInt(subOrganizationId.toString()) : null;
    }

    const query = { where, offset: 0, limit: 100000 };
    if (page && limit) {
      limit = limit;
      query.offset = (page - 1) * limit;
      query.limit = limit;
    }

    let res: { totalCount?: any; count: any; rows: any };
    res = await this.findAll(getAllAssessmentListInput, query);
    res.totalCount = res.count.length;
    res.count = res.rows.length;

    return res;
  }

  async getDefaultDimitraAssessments(countries?: string[]) {
    const where:any = {
      assessmentType: AssessmentType.DEFAULT_DIMITRA,

    }
    if(countries){
      where.countries = countries;
    }
    const assessments = await this.findAll(where);
    return assessments.rows;
  }
  async getAssessmentListOfOrganizationForDD(orgId: number) {
    const assessments = await this.findAll({
      assessmentType: AssessmentType.USER_CUSTOM,
      orgId,
    });
    return assessments.rows;
  }

  async findOne(id: number) {
    const assessmentDetail = await this.assessmentModel.findOne({
      where: {
        id,
        isDeleted: false,
      },
      include: [
        {
          attributes: [
            "id",
            "assessmentId",
            "expiryDate",
            "isScheduled",
            "scheduleDate",
            "scheduledEndDate",
            "isMultiStep",
            "multiStepType",
            "noOfQuestion",
            // "noOfHeadings",
            "allowMultipleEntries",
            "expiryPeriod",
          ],
          model: AssessmentSetting,
          as: "assessmentSettings",
        },
        {
          model: AssessmentSelectedUser,
          as: "assessmentSelectedUsers",
          required:false
        },
      ],
    });
    if (!assessmentDetail) {
      throw new Error("Assessment not found");
    }
    return assessmentDetail;
  }

  async update(id: number, updateAssessmentInput: UpdateAssessmentInput, authorization?: string) {
    let t = await this.sequelize.transaction();

    try {
      const existingAssessments = await this.assessmentModel.findOne({
        where: {
          id,
          isDeleted: false,
        },
        include: [
          {
            attributes: [
              "id",
              "assessmentId",
              "expiryDate",
              "isScheduled",
              "scheduleDate",
              "scheduledEndDate",
              "isMultiStep",
              "multiStepType",
              "noOfQuestion",
              // "noOfHeadings",
              "allowMultipleEntries",
            ],
            model: AssessmentSetting,
            as: "assessmentSettings",
          },
          {
            model: AssessmentSelectedUser,
            as: "assessmentSelectedUsers",
          },
        ],
      });
      if (!existingAssessments) {
        throw new Error("Assessment not found.");
      }

      await this.assessmentModel.update(
        {
          title: updateAssessmentInput.title || existingAssessments.title,
          countries: updateAssessmentInput.countries || existingAssessments.countries,
          description:
            updateAssessmentInput.description ||
            existingAssessments.description,
          status: updateAssessmentInput.status || existingAssessments.status,
          isApplicableToSelectedUsersOnly:
            updateAssessmentInput.isApplicableToSelectedUsersOnly ??
            existingAssessments.isApplicableToSelectedUsersOnly,
        },
        {
          where: {
            id,
          },
          transaction: t,
        }
      );
      const updateAssessmentSettingInput =
        updateAssessmentInput.assessmentSettings;
      const existingAssessmentSetting = existingAssessments.assessmentSettings;
      if (updateAssessmentSettingInput.isMultiStep) {
        if (
          !updateAssessmentSettingInput.multiStepType &&
          !existingAssessmentSetting.multiStepType
        ) {
          throw new Error(
            `Multi-step type should be one of 'HEADINGS' or 'QUESTIONS'`
          );
        }
      }
      if (
        updateAssessmentSettingInput.isScheduled &&
        (!updateAssessmentSettingInput.scheduleDate &&
          !existingAssessmentSetting.scheduleDate)
      ) {
        throw new Error(`Schedule Date is required.`);
      }

      const expiryDate  = updateAssessmentSettingInput.expiryDate
      ? moment(updateAssessmentSettingInput.expiryDate).format("YYYY-MM-DD")
      : existingAssessmentSetting.expiryDate || "";
      const assessmentSettingPayload = {
        allowMultipleEntries:
          updateAssessmentSettingInput.allowMultipleEntries ||
          existingAssessmentSetting.allowMultipleEntries,
        expiryDate,
        isMultiStep:
          updateAssessmentSettingInput.isMultiStep ??
          existingAssessmentSetting.isMultiStep,
        multiStepType:
          updateAssessmentSettingInput.multiStepType ||
          existingAssessmentSetting.multiStepType,
        // noOfHeadings:
        //   updateAssessmentSettingInput.noOfHeadings ||
        //   existingAssessmentSetting.noOfHeadings,
        noOfQuestion:
          updateAssessmentSettingInput.noOfQuestion ||
          existingAssessmentSetting.noOfQuestion,
        isScheduled:
          updateAssessmentSettingInput.isScheduled ??
          existingAssessmentSetting.isScheduled,
        scheduleDate: updateAssessmentSettingInput.isScheduled
          ? updateAssessmentSettingInput.scheduleDate
            ? moment(updateAssessmentSettingInput.scheduleDate).add(1,"days").format("YYYY-MM-DD")
            : moment(new Date()).format("YYYY-MM-DD")
          : null,
        scheduledEndDate: updateAssessmentSettingInput.isScheduled
          ? updateAssessmentSettingInput.scheduledEndDate
            ? moment(updateAssessmentSettingInput.scheduledEndDate).add(1,"days").format("YYYY-MM-DD")
            : moment(new Date()).format("YYYY-MM-DD")
          : null,
        expiryPeriod: expiryDate ? moment.utc(expiryDate).startOf('day').valueOf() - moment.utc().startOf('day').valueOf() : 0,
      };
      await this.assessmentSettingModel.update(assessmentSettingPayload, {
        where: {
          id: existingAssessmentSetting.id,
        },
        transaction: t,
      });

      await this.assessmentSelectedUserModel.destroy({
        where: {
          assessmentId: existingAssessments.id,
        },
        transaction: t,
      });

      if (updateAssessmentInput.isApplicableToSelectedUsersOnly) {
        const selectedUserAssessment =
          updateAssessmentInput.assessmentSelectedUsers.map(
            (selectedUserId) => {
              return {
                assessmentId: existingAssessments.id,
                userId: selectedUserId,
              };
            }
          );
        await this.assessmentSelectedUserModel.bulkCreate(
          selectedUserAssessment,
          {
            transaction: t,
          }
        );
        if (
          updateAssessmentInput.assessmentSelectedUsers.length > 0 &&
          authorization
        ) {
          const existingUserIds =
            existingAssessments.assessmentSelectedUsers.map(
              (user) => user.userId
            );
          const newUserIds =
            updateAssessmentInput.assessmentSelectedUsers.filter(
              (userId) => !existingUserIds.includes(userId)
            );

          if (newUserIds.length > 0) {
            await this.sendPushNotificationToUsers(
              existingAssessments.title,
              existingAssessments.id,
              newUserIds,
              authorization
            );
          }
        }
      }
      await t.commit();

      return existingAssessments;
    } catch (err) {
      console.log(err);
      await t.rollback();
      throw new Error(err.message);
    }
  }

  async remove(id: number) {
    await this.assessmentModel.update(
      {
        isDeleted: true,
      },
      { where: { id } }
    );
    return true;
  }

  async increaseAssessmentQuestionCount(id: number, increment: number) {
    await this.assessmentModel.update(
      {
        noOfQuestions: increment,
      },
      { where: { id } }
    );
    return true;
  }

  async increaseAssessmentResponseCount(id: number, increment: number) {
    await this.assessmentModel.increment(
      {
        noOfResponse: increment,
      },
      { where: { id } }
    );
    return true;
  }

  async getAssessmentSummary(diligenceId: number, assessmentId: number, farmsList) {
    let farmsListQuery = ``, as3FarmListQuery = ``
    if(farmsList.length > 0) {
        farmsListQuery = `user_farm_id in (${farmsList.join(",")})  AND assessment_id = ${assessmentId}`
        as3FarmListQuery = `as3.user_farm_id in (${farmsList.join(",")})  AND as3.assessment_id = ${assessmentId}`
    } else {
      farmsListQuery = `assessment_id = ${assessmentId}`
      as3FarmListQuery = `as3.assessment_id = ${assessmentId}`
    }
    const statusQuery = (status: SurveyStatus) => `
      SELECT
        COUNT(as3.id) AS ###
      FROM
        assessment_surveys as3
      INNER JOIN (
        SELECT
          id,
          user_farm_id,
          status,
          assessment_id,
          due_diligence_id,
          MAX(createdAt) as latestDate
        FROM
          assessment_surveys
        WHERE
          ${farmsListQuery}
        GROUP BY
          user_farm_id
              ) as2 ON
        as2.user_farm_id = as3.user_farm_id
      WHERE
       ${as3FarmListQuery}
        AND as3.status = '${status}'
        AND as3.createdAt = as2.latestDate
    `;

    const summaryMetrics = {
      totalNoOfFarms: `SELECT COUNT(drddpp.id) AS ### FROM due_diligence_production_places dp
        INNER JOIN diligence_reports_due_diligence_production_places drddpp ON drddpp.dueDiligenceProductionPlaceId = dp.id
          WHERE drddpp.diligenceReportId = ${diligenceId} AND drddpp.removed = 0;`,
      assessmentsCompleted: statusQuery(SurveyStatus.COMPLETED),
      assessmentsPending: statusQuery(SurveyStatus.IN_PROGRESS),
      requiredMitigation: `SELECT COUNT(dp.id) as ### FROM due_diligence_production_places dp
        INNER JOIN diligence_reports_due_diligence_production_places drddpp ON drddpp.dueDiligenceProductionPlaceId = dp.id
        INNER JOIN assessment_production_place app ON app.productionPlaceId = dp.id
        WHERE drddpp.diligenceReportId = ${diligenceId} AND app.assessmentId = ${assessmentId} AND drddpp.removed = 0 AND riskAssessmentStatus = 'mitigation_required'`,
    };

    const assessmentSummary: AssessmentSummary = {
      totalNoOfFarms: 0,
      assessmentsCompleted: 0,
      assessmentsPending: 0,
      requiredMitigation: 0
    }

    for await (const [metric, query] of Object.entries(summaryMetrics)) {
      assessmentSummary[metric] = (await this.sequelize.query(query.replace("###", metric)))[0][0][metric];
    }

    return assessmentSummary;
  }
}
