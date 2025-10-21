import { Inject, Injectable, Logger } from "@nestjs/common";
import { GetAllAssessmentListInput } from "./dto/create-assessment-builder.input";
import { InjectModel } from "@nestjs/sequelize";
import { Assessment } from "./entities/assessment.entity";
import { AssessmentSelectedUser } from "./entities/assessment-users.entity";
import { AssessmentSetting } from "./entities/assessment-setting.entity";
import { AssessmentType } from "./dto/AssessmentType";
import { Op, QueryTypes } from "sequelize";
import { AssessmentQuestions } from "./entities/assessment-questions.entity";
import { AssessmentQuestionHeading } from "./entities/assessment-question-headings.entity";
import { AssessmentSurvey, SurveyStatus } from "./entities/assessment-survey.entity";
import { Farm } from "src/farms/entities/farm.entity";
import { AssessmentResponse } from "./entities/assessment-response.entity";
import { CreateSurveyResponseInput } from "./dto/create-assessment-response.input";
import { AllowMultipleEntries } from "./dto/AllowMultipleEntries";
import { AssessmentQuestionOptions } from "./entities/assessment-question-options.entity";
import { Sequelize } from "sequelize-typescript";
import { DiligenceReportProductionPlace } from 'src/diligence-report/entities/diligence-report-production-place.entity';
import { DiligenceReportAssessmentSurveys } from 'src/diligence-report/entities/diligence-report-assessment-survey.entity';
import { UserDDS } from 'src/users/entities/dds_user.entity';


class DuplicateFoundError extends Error {}

@Injectable()
export class AssessmentBuilderMobileService {
  constructor(
    @InjectModel(Assessment)
    private readonly assessmentModel: typeof Assessment,

    @InjectModel(AssessmentSurvey)
    private assessmentSurveyModel: typeof AssessmentSurvey,

    @InjectModel(AssessmentSelectedUser)
    private assessmentSelectedUserModel: typeof AssessmentSelectedUser,

    @InjectModel(AssessmentResponse)
    private assessmentResponseModel: typeof AssessmentResponse,

    @InjectModel(Farm)
    private farmModel: typeof Farm,

    @InjectModel(AssessmentQuestions)
    private assessmentQuestionModel: typeof AssessmentQuestions,

    @InjectModel(DiligenceReportProductionPlace)
    private reportProductionPlaceModel: typeof DiligenceReportProductionPlace,

    @InjectModel(DiligenceReportAssessmentSurveys)
    private reportAssessmentSurveyModel: typeof DiligenceReportAssessmentSurveys,

    @Inject("SEQUELIZE")
    private readonly sequelize: Sequelize,
  ) {}

  async findAll(
    getAllAssessmentListInput: GetAllAssessmentListInput,
    paginationQuery: {
      offset?: number;
      limit?: number;
    } = {}
  ) {
    let {
      search,
      assessmentType = AssessmentType.USER_CUSTOM,
      orgId,
      status,
      userId,
      sortOrder = "DESC",
      sortColumn = "id",
    } = getAllAssessmentListInput;

    let where: any = {
      isDeleted: false,
    };

    if (orgId) {
      where.orgId = orgId;
    }
    if (userId) {
      where.userId = {
        [Op.or]: [userId, null],
      };
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
      order: [[sortColumn || "id", sortOrder || "DESC"]],
      attributes: [
        "id",
        "title",
        "description",
        "noOfQuestions",
        "noOfResponse",
        "status",
        "country",
        "isApplicableToSelectedUsersOnly",
        "isDefault",
      ],
      include: [
        {
          model: AssessmentQuestions,
          as: "assessmentQuestions",
        },
        {
          model: AssessmentQuestionHeading,
          as: "assessmentQuestionHeading",
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

  async findAssessmentByUser(
    getAllAssessmentListInput: GetAllAssessmentListInput,
    userDdsId: number,
    paginationQuery: {
      offset?: number;
      limit?: number;
    } = {}
  ) {
    let {
      userId,
      sortOrder = 'ASC',
      sortColumn = 'id'
    } = getAllAssessmentListInput;

    const assessments = await this.assessmentSelectedUserModel.findAndCountAll({
      where: {
        userId: userId,
      },
      include: [
        {
          model: Assessment,
          where: {
            status: "ACTIVE",
          },
          include: [
            {
              model: AssessmentQuestionHeading,
              as: 'assessmentQuestionHeading',
              include: [
                {
                  model: AssessmentQuestions,
                  as: 'assessmentQuestions',
                  include: [
                    {
                      model: AssessmentQuestionOptions,
                      as: 'options'
                    }
                  ]
                }
              ]
            },
            {
              model: AssessmentQuestions,
              as: 'assessmentQuestions',
              include: [
                {
                  model: AssessmentQuestionOptions,
                  as: 'options'
                }
              ]
            },
            {
              model: AssessmentSetting,
              as: 'assessmentSettings'
            }
          ]
        }
      ],
      ...paginationQuery,
      order: [[sortColumn || 'id', sortOrder || 'ASC']],
      group: ["id"]
    });

    const combinedAssessments = [];
    const userFarms = await this.farmModel.findAll({
      where: {
        [Op.or]: [
          { userId },
          ...(userDdsId ? [{ userDdsId }] : [])
        ]
      },
      attributes: ['id'],
    });
    const farmIds = userFarms.map(farm => farm.id);

    for await (const { assessment } of assessments.rows) {
      const filteredSurveys: AssessmentSurvey[] = [];

      const surveys = await this.assessmentSurveyModel.findAll({
        where: {
          assessmentId: assessment.id,
        },
        include: [
          {
            model: Farm,
            attributes: ['id', 'farmName', 'cf_farmid'],
            required: true,
            where: {
              id: { [Op.in]: farmIds },
            },
          },
          {
            model: AssessmentResponse,
            as: 'surveyResponses',
            where: {
              isLatestVersionResponse: true,
              userId: userId,
            }
          }
        ]
      });

      surveys.forEach((survey) => {
        filteredSurveys.forEach((fs, i) => {
          if (fs.userFarmId === survey.userFarmId) {
            if (new Date(survey.createdAt) > new Date(fs.createdAt)) {
              filteredSurveys.splice(i, 1);
              Logger.error('Duplicate survey found for same farm', { fs, survey });
            }
          }
        });
        filteredSurveys.push(survey);
      });

      combinedAssessments.push({
        ...JSON.parse(JSON.stringify(assessment)),
        surveys: filteredSurveys
      });
    } 

    return {
      assessments: {
        count: combinedAssessments.length,
        rows: combinedAssessments
      }
    };
  }

  async findAllAssessmentList(
    getAllAssessmentListInput: GetAllAssessmentListInput
  ) {
    let { page = 1, limit = 100000 } = getAllAssessmentListInput;

    const query = { offset: 0, limit: 100000 };
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
          required: false,
        },
      ],
    });
    if (!assessmentDetail) {
      throw new Error("Assessment not found");
    }
    return assessmentDetail;
  }

  async saveResponse(createSurveyResponseInput: CreateSurveyResponseInput) {
    try {
      const assessmentDetail = await this.findOne(
        createSurveyResponseInput.assessmentId
      );
      const assessmentSettings = assessmentDetail.assessmentSettings;
      const isMultipleAllowed =
        assessmentSettings.allowMultipleEntries ===
          AllowMultipleEntries.ANY_TIME ||
        (assessmentSettings.allowMultipleEntries ===
          AllowMultipleEntries.AFTER_EXPIRY &&
          Date.parse(assessmentSettings.expiryDate) < Date.now());

      let assessmentSurveyDetail = await this.assessmentSurveyModel.findOne({
        where: {
          assessmentId: assessmentDetail.id,
          userId: createSurveyResponseInput.userId,
          userFarmId: createSurveyResponseInput.userFarmId,
        },
      });

      let reportProductionPlace: DiligenceReportProductionPlace;

      if(createSurveyResponseInput.dueDiligenceId) {
        reportProductionPlace = await this.reportProductionPlaceModel.findOne({
          attributes: ['id', 'dueDiligenceProductionPlaceId'],
          where: {
            farmId: createSurveyResponseInput.userFarmId,
            diligenceReportId: createSurveyResponseInput.dueDiligenceId,
          }
        });
      }

      if (!assessmentSurveyDetail) {
        assessmentSurveyDetail = await this.assessmentSurveyModel.create({
          assessmentId: assessmentDetail.id,
          userId: createSurveyResponseInput.userId,
          userFarmId: createSurveyResponseInput.userFarmId,
          farmId: reportProductionPlace?.dueDiligenceProductionPlaceId,
          signatureS3Key:
            createSurveyResponseInput.signatureDetails?.signatureS3Key,
          signatureS3Location:
            createSurveyResponseInput.signatureDetails?.signatureS3Location,
          signatureOwner:
            createSurveyResponseInput.signatureDetails?.signatureOwner,
          signatureCreatedAt:
            createSurveyResponseInput.signatureDetails?.createdAt,
        });
      } else if (createSurveyResponseInput.signatureDetails) {
        assessmentSurveyDetail.signatureS3Key =
          createSurveyResponseInput.signatureDetails.signatureS3Key;
        assessmentSurveyDetail.signatureS3Location =
          createSurveyResponseInput.signatureDetails.signatureS3Location;
        assessmentSurveyDetail.signatureOwner =
          createSurveyResponseInput.signatureDetails.signatureOwner;
        assessmentSurveyDetail.signatureCreatedAt =
          createSurveyResponseInput.signatureDetails.createdAt;
        await assessmentSurveyDetail.save();
      }

      if(reportProductionPlace) {
        const reportAssessmentSurvey = await this.reportAssessmentSurveyModel.findOne({
          where: {
            diligenceReportId: createSurveyResponseInput.dueDiligenceId,
            assessmentSurveyId: assessmentSurveyDetail.id,
            diligenceReportProductionPlaceId: reportProductionPlace.id,
          }
        });
        if(!reportAssessmentSurvey) {
          await this.reportAssessmentSurveyModel.create({
            diligenceReportId: createSurveyResponseInput.dueDiligenceId,
            assessmentSurveyId: assessmentSurveyDetail.id,
            diligenceReportProductionPlaceId: reportProductionPlace.id,
          });
        }
      }

      for (
        let i = 0;
        i < createSurveyResponseInput.surveyResponses.length;
        i++
      ) {
        const element = createSurveyResponseInput.surveyResponses[i];
        const isResponseForQuestionAlreadyExists = 
          await this.assessmentResponseModel.findAll({
            where: {
              surveyId: assessmentSurveyDetail.id,
              questionId: element.questionId,
              userId: createSurveyResponseInput.userId,
            },
            order: [["createdAt", "DESC"]],
          });

          // Construct attachmentLink for fileAndDigitalSignatureFieldAnswer
          if (element.response.fileAndDigitalSignatureFieldAnswer) {
          element.response.fileAndDigitalSignatureFieldAnswer.forEach(
            (answer) => {
              if (answer.s3key) {
                answer.attachmentLink = `https://${process.env.APP_AWS_BUCKET}.s3.${process.env.AWS_REGION_PUBLIC_BUCKET_REGION}.amazonaws.com/dds_user_data/survey_attachment/${answer.s3key}`;
              }
            }
          );
        }

        const questionDetail = await this.assessmentQuestionModel.findOne({
          where: {
            id: element.questionId,
          },
          include: [
            {
              model: AssessmentQuestionOptions,
              as: 'options',
            }
          ]
        })

        if (!isResponseForQuestionAlreadyExists.length || isMultipleAllowed) {
          await this.assessmentResponseModel.update(
            {
              isLatestVersionResponse: false,
            },
            {
              where: {
                surveyId: assessmentSurveyDetail.id,
                questionId: element.questionId,
                userId: {
                  [Op.or]: [createSurveyResponseInput.userId, null],
                },
              },
            }
          );

          await this.assessmentResponseModel.create({
            surveyId: assessmentSurveyDetail.id,
            questionId: element.questionId,
            userId: createSurveyResponseInput.userId,
            submittedBy : createSurveyResponseInput.submittedBy,
            questionDetail: questionDetail,
            response: element.response,
            isLatestVersionResponse: true,
          });
        } else {
          await this.assessmentResponseModel.update(
            {
              questionDetail: questionDetail,
              response: element.response,
              isLatestVersionResponse: true,
            },
            {
              where: {
                id: isResponseForQuestionAlreadyExists[0].id,
                userId: {
                  [Op.or]: [createSurveyResponseInput.userId, null],
                },
              },
            }
          );
        }
      }

      // Updating survey status
      if (createSurveyResponseInput.status) {
        const updatePayload = {
          status: createSurveyResponseInput.status,
          expiresOn: null,
        };

        if (createSurveyResponseInput.status === SurveyStatus.COMPLETED) {
          if (assessmentSettings) {
            updatePayload.expiresOn = new Date(Date.now() + Number(assessmentSettings.expiryPeriod || 0));
          }
        }

        await this.assessmentSurveyModel.update(
          updatePayload, 
          {
            where: {
              id: assessmentSurveyDetail.id,
            }
          }
        );
      }

      return this.findOneResponse(assessmentSurveyDetail.id);
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }

  async findOneResponse(id: number) {
    return await this.assessmentSurveyModel.findOne({
      where: {
        id,
      },
      include: [
        {
          model: Farm,
          attributes: ['id', 'farmName', 'cf_farmid'],
        },
        {
          model: AssessmentResponse,
          as: "surveyResponses",
          where:{
            isLatestVersionResponse: true
          }
        },
      ],
    });
  }

   async getPendingAssessmentsCount(surveyFarms: number[], userId: number): Promise<number> {
    try{
      let totalSurveyCountForFarm: number;
      if(surveyFarms.length) {
        const totalSurveyCountForFarmResult =  await this.sequelize.query(
          `
          SELECT COUNT(DISTINCT assessment_id) AS count
          FROM assessment_surveys
          WHERE user_id = :userId
          AND user_farm_id IN (:surveyFarms)
          `,
          {
            replacements: { userId, surveyFarms },
            type: QueryTypes.SELECT,
          }
        );
    
        totalSurveyCountForFarm = (totalSurveyCountForFarmResult[0] as any).count;
      }
      else{
        totalSurveyCountForFarm = 0;
      }
      const totalAsessmentCount = await this.assessmentModel.count({
        where:{
          status: "ACTIVE",
        },
        include: [
          {
            model: AssessmentSelectedUser,
            where: {
              userId: userId,
            },
            required: true,
          }
        ]
      });
      const count = totalAsessmentCount - totalSurveyCountForFarm;

      return count;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}
