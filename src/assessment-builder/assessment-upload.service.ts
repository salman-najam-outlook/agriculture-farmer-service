import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateAssessmentUploadInput } from "./dto/assessment-upload.input";
import { S3Service } from "../upload/upload.service";
import { InjectModel } from "@nestjs/sequelize";
import { AssessmentUploads } from "./entities/assessment-uploads.entity";
import { Sequelize } from "sequelize-typescript";
import { AssessmentProductionPlace } from "./entities/assessment-production-place.entity";
import { DueDiligenceProductionPlace } from "src/due-diligence/production-place/entities/production-place.entity";
import { Op, WhereOptions } from "sequelize";
import { DiligenceReportProductionPlace } from 'src/diligence-report/entities/diligence-report-production-place.entity';
import { DiligenceReportAssessmentUpload } from 'src/diligence-report/entities/diligence-report-assessment-upload.entity';

@Injectable()
export class AssessmentUploadService {
  constructor(
    private readonly s3Service: S3Service,
    @InjectModel(AssessmentUploads)
    private assessmentUploadModal: typeof AssessmentUploads,
    @InjectModel(AssessmentProductionPlace)
    private assessmentProductionPlaceService: typeof AssessmentProductionPlace,
    @InjectModel(DueDiligenceProductionPlace)
    private productionPlaceModel : typeof DueDiligenceProductionPlace,
    @InjectModel(DiligenceReportProductionPlace)
    private reportProductionPlaceModel : typeof DiligenceReportProductionPlace,
    @InjectModel(DiligenceReportAssessmentUpload)
    private reportAssessmentUploadModel : typeof DiligenceReportAssessmentUpload,

  ) {}

  async create(
    createAssessmentUploadInput: CreateAssessmentUploadInput
  ): Promise<{ message: string; status: boolean }> {
    const { fileDetails, assessment_id, diligence_report_id, production_place_id} =
      createAssessmentUploadInput;
      
    try {
      if (fileDetails && fileDetails.length > 0) {
        if (production_place_id) {
          const reportProductionPlace = await this.reportProductionPlaceModel.findOne({
            where: {
              diligenceReportId: diligence_report_id,
              dueDiligenceProductionPlaceId: production_place_id,
            },
          });
          // Handle individual production place upload
          for (const fileDetail of fileDetails) {
            const { id: fileDetailId, ...fileDetailData } = fileDetail;
  
            // Check for an existing record based on the provided conditions
            let record;
            if (fileDetailId) {
              // Try to find the record by file detail ID if it exists
              record = await this.assessmentUploadModal.findOne({
                where: {
                  id: fileDetailId,
                  assessment_id,
                  farmId: reportProductionPlace.farmId,
                },
              });
            }
  
            if (record) {
              // Update existing record with new data
              await record.update(fileDetailData);
            } else {
              // Create a new record if it doesn't exist
              record = await this.assessmentUploadModal.create({
                production_place_id,
                diligence_report_id,
                farmId: reportProductionPlace.farmId,
                assessment_id,
                ...fileDetailData,
              });
            }
            const exists = await this.reportAssessmentUploadModel.findOne({
              where: {
                diligenceReportProductionPlaceId: reportProductionPlace.id,
                assessmentUploadId: record.id,
              }
            });
            if(!exists) {
              await this.reportAssessmentUploadModel.create({
                diligenceReportProductionPlaceId: reportProductionPlace.id,
                assessmentUploadId: record.id,
                diligenceReportId: diligence_report_id,
              });
            }
          }
        } else {
          for (const fileDetail of fileDetails) {
            const { id: fileDetailId, ...fileDetailData } = fileDetail;

            let record;
            if (fileDetailId) {
              // Try to find the record by file detail ID if it exists
              record = await this.assessmentUploadModal.findOne({
                where: {
                  id: fileDetailId,
                  diligence_report_id,
                  assessment_id,
                },
              });
            }

            if (record) {
              // Update existing record with new data
              await record.update(fileDetailData);
            } else {
              // Create a new record if it doesn't exist
              record = await this.assessmentUploadModal.create({
                production_place_id: null,
                diligence_report_id,
                assessment_id,
                ...fileDetailData,
              });
            }
            const exists = await this.reportAssessmentUploadModel.findOne({
              where: {
                diligenceReportProductionPlaceId: { [Op.is]: null },
                diligenceReportId: diligence_report_id,
                assessmentUploadId: record.id,
              }
            });
            if(!exists) {
              await this.reportAssessmentUploadModel.create({
                diligenceReportId: diligence_report_id,
                assessmentUploadId: record.id,
                diligenceReportProductionPlaceId: null,
              });
            }
          }
        }
      }
  
      return {
        message: "Successfully updated risk assessment status.",
        status: true,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        `Failed to upload files. ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  async findAll(assessment_id: number, diligence_report_id: number, production_place_id?: number) {
    try {
      const reportAssessmentFilter: WhereOptions = {
        diligenceReportId: diligence_report_id,
      };
  
      if (production_place_id) {
        const diligenceReportProductionPlace = await this.reportProductionPlaceModel.findOne({
          where: {
            diligenceReportId: diligence_report_id,
            dueDiligenceProductionPlaceId: production_place_id,
          }
        });
        reportAssessmentFilter.diligenceReportProductionPlaceId = diligenceReportProductionPlace.id || { [Op.in]: [null] };
      } else {
        reportAssessmentFilter.diligenceReportProductionPlaceId = { [Op.is]: null };
      }
      
      const res = await this.assessmentUploadModal.findAndCountAll({
        where: { assessment_id },
        include: [
          {
            model: DiligenceReportAssessmentUpload,
            where: reportAssessmentFilter,
            required: true,
            attributes: [],
          }
        ]
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteFile(id: number, assessmentId: number, diligenceReportId: number, productionPlaceId?:number){
    const whereClause: any = { };

    if (productionPlaceId) {
        whereClause.id = id;
        whereClause.production_place_id = productionPlaceId;
    } else {
        whereClause.assessment_id = assessmentId;
        whereClause.diligence_report_id = diligenceReportId;
    }

    const result = await this.assessmentUploadModal.destroy({
      where: whereClause
    });

    if (result === 0) {
      return {
        message: `File with id ${id} not found.`,
        status: false
      };
    }
    return {
      message: `File with id ${id} deleted successfully.`,
      status: true
    };
  }
}
