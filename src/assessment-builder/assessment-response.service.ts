import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { AssessmentBuilderService } from "./assessment-builder.service";
import { CreateSurveyResponseInput } from "./dto/create-assessment-response.input";
import { AssessmentResponse } from "./entities/assessment-response.entity";
import { AllowMultipleEntries } from "./dto/AllowMultipleEntries";
import { AssessmentSurvey, SurveyStatus } from "./entities/assessment-survey.entity";
import { Op } from "sequelize";
import { AssessmentSetting } from "./entities/assessment-setting.entity";
import { AssessmentQuestions } from "./entities/assessment-questions.entity";
import { DiligenceReportProductionPlace } from 'src/diligence-report/entities/diligence-report-production-place.entity';
import { DiligenceReportAssessmentSurveys } from 'src/diligence-report/entities/diligence-report-assessment-survey.entity';
import { DiligenceReportAssessmentResponse } from 'src/diligence-report/entities/diligence-report-assessment-response.entity';
import { AssessmentQuestionOptions } from "./entities/assessment-question-options.entity";

@Injectable()
export class AssessmentSurveyService {
  constructor(
    @Inject("SEQUELIZE")
    private readonly sequelize: Sequelize,

    @InjectModel(AssessmentSetting)
    private assessmentSettingModel: typeof AssessmentSetting,

    @InjectModel(AssessmentSurvey)
    private assessmentSurveyModel: typeof AssessmentSurvey,

    @InjectModel(AssessmentResponse)
    private assessmentResponseModel: typeof AssessmentResponse,

    @InjectModel(AssessmentQuestions)
    private assessmentQuestionModel: typeof AssessmentQuestions,
    
    @InjectModel(DiligenceReportProductionPlace)
    private reportProductionPlaceModel: typeof DiligenceReportProductionPlace,
    
    @InjectModel(DiligenceReportAssessmentSurveys)
    private reportAssessmentSurveyModel: typeof DiligenceReportAssessmentSurveys,
    
    @InjectModel(DiligenceReportAssessmentResponse)
    private reportAssessmentResponseModel: typeof DiligenceReportAssessmentResponse,

    private readonly assessmentService: AssessmentBuilderService
  ) {}

  async saveResponse(createSurveyResponseInput: CreateSurveyResponseInput) {
    try {
      const assessmentDetail = await this.assessmentService.findOne(
        createSurveyResponseInput.assessmentId
      );

      const assessmentSettings = assessmentDetail.assessmentSettings;
      const isMultipleAllowed =
        assessmentSettings.allowMultipleEntries ===
          AllowMultipleEntries.ANY_TIME ||
        (assessmentSettings.allowMultipleEntries ===
          AllowMultipleEntries.AFTER_EXPIRY &&
          Date.parse(assessmentSettings.expiryDate) < Date.now());

      let assessmentSurveyDetail: AssessmentSurvey;
      if(createSurveyResponseInput.userFarmId) {
        assessmentSurveyDetail = await this.assessmentSurveyModel.findOne({
          where: {
            assessmentId: assessmentDetail.id,
            userId: createSurveyResponseInput.userId,
            userFarmId: createSurveyResponseInput.userFarmId,
          },
        });
        const reportProductionPlace = await this.reportProductionPlaceModel.findOne({
          attributes: ['id', 'dueDiligenceProductionPlaceId'],
          where: {
            farmId: createSurveyResponseInput.userFarmId,
            diligenceReportId: createSurveyResponseInput.dueDiligenceId,
          }
        });
        if (!assessmentSurveyDetail) {
          assessmentSurveyDetail = await this.assessmentSurveyModel.create({
            assessmentId: assessmentDetail.id,
            userFarmId: createSurveyResponseInput.userFarmId,
            userId: createSurveyResponseInput.userId,
            farmId: reportProductionPlace?.dueDiligenceProductionPlaceId,
            signatureS3Key: createSurveyResponseInput.signatureDetails?.signatureS3Key,
            signatureS3Location: createSurveyResponseInput.signatureDetails?.signatureS3Location,
            dueDiligenceId: createSurveyResponseInput.dueDiligenceId,
          });
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
      } else {
        assessmentSurveyDetail = await this.assessmentSurveyModel.findOne({
          where: {
            assessmentId: assessmentDetail.id,
            dueDiligenceId: createSurveyResponseInput.dueDiligenceId,
            userId: createSurveyResponseInput.userId,
            userFarmId: { [Op.is]: null },
          }
        });
        if(!assessmentSurveyDetail) {
          assessmentSurveyDetail = await this.assessmentSurveyModel.create({
            dueDiligenceId: createSurveyResponseInput.dueDiligenceId,
            assessmentId: assessmentDetail.id,
            userFarmId: null,
            userId: createSurveyResponseInput.userId,
            farmId: null,
            signatureS3Key: createSurveyResponseInput.signatureDetails?.signatureS3Key,
            signatureS3Location: createSurveyResponseInput.signatureDetails?.signatureS3Location,
          });
        }
        const reportAssessmentSurvey = await this.reportAssessmentSurveyModel.findOne({
          where: {
            diligenceReportId: createSurveyResponseInput.dueDiligenceId,
            assessmentSurveyId: assessmentSurveyDetail.id,
            diligenceReportProductionPlaceId: { [Op.is]: null },
          }
        });
        if(!reportAssessmentSurvey) {
          await this.reportAssessmentSurveyModel.create({
            diligenceReportId: createSurveyResponseInput.dueDiligenceId,
            assessmentSurveyId: assessmentSurveyDetail.id,
            diligenceReportProductionPlaceId: null,
          });
        }
      }

      if (createSurveyResponseInput.signatureDetails) {
        assessmentSurveyDetail.signatureS3Key = createSurveyResponseInput.signatureDetails.signatureS3Key;
        assessmentSurveyDetail.signatureS3Location = createSurveyResponseInput.signatureDetails.signatureS3Location;
        await assessmentSurveyDetail.save();
      }

      const responseIds = [];
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
              userId: createSurveyResponseInput.userId
            },
            order: [["createdAt", "DESC"]],
          });

        const questionDetail = await this.assessmentQuestionModel.findOne({
            where: {
              id: element.questionId,
            },
            include: [
              {
                model: AssessmentQuestionOptions,
              },
            ],
          });

        if (!isResponseForQuestionAlreadyExists.length || isMultipleAllowed) {
          await this.assessmentResponseModel.update({
            isLatestVersionResponse: false
          },{
            where:{
              surveyId: assessmentSurveyDetail.id,
              questionId: element.questionId,
              userId: {
                [Op.or]: [createSurveyResponseInput.userId, null],
              }
            },   
          });
          const newResponse = await this.assessmentResponseModel.create({
            surveyId: assessmentSurveyDetail.id,
            questionId: element.questionId,
            userId: createSurveyResponseInput.userId,
            questionDetail: questionDetail,
            response: element.response,
            isLatestVersionResponse: true
          });
          responseIds.push(newResponse.id);
        } else {
          await this.assessmentResponseModel.update(
            {
              questionDetail: questionDetail,
              response: element.response,
              isLatestVersionResponse: true
            },
            {
              where: {
                id: isResponseForQuestionAlreadyExists[0].id,
                userId: {
                  [Op.or]: [createSurveyResponseInput.userId, null],
                }
              },
            }
          );
          responseIds.push(isResponseForQuestionAlreadyExists[0].id);
        }
      }

      const existingReportResponses = await this.reportAssessmentResponseModel.findAll({
        where: {
          diligenceReportId: createSurveyResponseInput.dueDiligenceId,
          assessmentResponseId: { [Op.in]: responseIds }
        }
      });
      const nonExistingResponseIds = responseIds.filter(id => !existingReportResponses.find(item => item.assessmentResponseId == id));
      const newReportResponses = nonExistingResponseIds.map(id => ({ assessmentResponseId: id, diligenceReportId: createSurveyResponseInput.dueDiligenceId }));
      await this.reportAssessmentResponseModel.bulkCreate(newReportResponses);

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

      return this.findOne(assessmentSurveyDetail.id);
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }

  async findAllResponse(
    assessmentId: number,
    dueDiligenceId?: number,
    farmId?: number,
    userId?: number,
  ) {

    const where: any = {
      assessmentId
    };
    if(farmId) {
      where.userFarmId = farmId;
    } else {
      where.userFarmId =  { [Op.is]: null };
    }
    if (userId) {
      where.userId = userId;
    }

    //userId: userId,
    const surveyDetails = await this.assessmentSurveyModel.findOne({
      where,
      include: [
        {
          where:{
            isLatestVersionResponse: 1
          },
          model: AssessmentResponse,
          as: "surveyResponses",
          include: [
            ...((dueDiligenceId && !farmId) ? [{
              model: DiligenceReportAssessmentResponse,
              required: true,
              attributes: [],
              where: {
                diligenceReportId: dueDiligenceId,
              }
            }] : [])
          ]
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return surveyDetails;
  }

  async findOne(id: number) {
    return await this.assessmentSurveyModel.findOne({
      where: {
        id,
      },
      include: [
        {
          model: AssessmentResponse,
          as: "surveyResponses",
        },
      ],
    });
  }
}
