import { Inject, Injectable, HttpException, NotFoundException, Logger, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { DiligenceReport } from 'src/diligence-report/entities/diligence-report.entity';
import {
    ChangeStatusOfDiligenceReportInput
} from 'src/diligence-report/dto/create-diligence-report.input';
import { Op } from 'sequelize'
import { DueDiligenceProductionPlace, EudrDeforestationStatus, RiskAssessmentStatus } from 'src/due-diligence/production-place/entities/production-place.entity';
import { Job, JobStatus } from 'src/job/entities/job.entity';
import { Farm } from 'src/farms/entities/farm.entity';
import { JobService } from 'src/job/job.service';
import { FarmCoordinates } from 'src/farms/entities/farmCoordinates.entity';
import { Geofence } from 'src/geofence/entities/geofence.entity';
import { GeofenceCoordinates } from "src/geofence/entities/geofenceCoordinates.entity";
import axios from 'axios';
import { withRetry } from 'src/helpers/api-call.helper';
import { DiligenceReportProductionPlace } from 'src/diligence-report/entities/diligence-report-production-place.entity';
import { ProductionPlaceDeforestationInfo } from './entities/production-place-deforestation-info.entity';
import { DiligenceReportAssessment } from 'src/diligence-report/entities/diligence-report-assessment.entity';
import { AssessmentProductionPlace } from 'src/assessment-builder/entities/assessment-production-place.entity';



@Injectable()
export class ProductionPlaceWarningService {
    constructor(
        @InjectModel(DiligenceReport) private DiligenceReportModel: typeof DiligenceReport,
        @InjectModel(DueDiligenceProductionPlace) private DueDiligenceProductionPlaceModel: typeof DueDiligenceProductionPlace,
        @InjectModel(DiligenceReportProductionPlace) private ReportProductionPlaceModel: typeof DiligenceReportProductionPlace,
        @InjectModel(FarmCoordinates) private FarmCoordinateModel: typeof FarmCoordinates,
        @InjectModel(AssessmentProductionPlace) private AssessmentProductionPlaceModel: typeof AssessmentProductionPlace,
        @Inject(forwardRef(() => JobService)) private jobService: JobService,
        @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
        
    ) {}

    async getIsAllAssessmentStatusApproved(reportId:number, assessmentId:number, productionPlaceIds:number[]){
      const assessments = await this.AssessmentProductionPlaceModel.findAll({
        attributes:['id','riskAssessmentStatus'],
        where:{
            diligenceReportId:reportId,
            assessmentId:assessmentId,
            productionPlaceId:{
                [Op.in]:productionPlaceIds
            }
        }
      })
      return assessments.every(x => x.riskAssessmentStatus == RiskAssessmentStatus.APPROVED)
    }

    async getProductionPlacesByReports(reportId:number) {
        return await this.ReportProductionPlaceModel.findAll({
            where: {
                diligenceReportId: reportId,
                removed: false,
            },
            include: [
                {
                    model: ProductionPlaceDeforestationInfo,
                    required: false,
                },
                {
                    model:DueDiligenceProductionPlace,
                    required:true,
                    as:'productionPlace'
                },
                {
                    model: Farm,
                    as: 'farm',
                    attributes:['id','cf_farmid', 'farmName', 'lat', 'log', 'area', 'country', 'farmType','isDeleted', 'createdAt'],
                    where:{
                        isDeleted:0
                    },
                    required: true,
                    include: [
                        {
                            model: Geofence,
                            as: "GeoFences",
                            attributes:['id','farmId','geofenceCenterLat','geofenceCenterLog','geofenceRadius'],
                            required: false,
                            include: [
                                {
                                    model: GeofenceCoordinates,
                                    attributes:['id','lat','log'],
                                    as: "geofenceCoordinates",
                                    required: false
                                },
                            ]
                        },
                    ]
                },
            ]
        });
    }  

    async getProductionPlacesByProductionIds(productionPlaceIds:number[], diligenceReportId: number) {
        const includeParams = [{
            model: Farm,
            as: 'farm',
            attributes:['id','cf_farmid', 'farmName', 'lat', 'log', 'area', 'country', 'farmType','isDeleted', 'createdAt'],
            where:{
                isDeleted:0
            },
            required: true,
            include: [
                {
                    model: Geofence,
                    as: "GeoFences",
                    attributes:['id','farmId','geofenceCenterLat','geofenceCenterLog','geofenceRadius'],
                    required: false,
                    include: [
                        {
                            model: GeofenceCoordinates,
                            attributes:['id','lat','log'],
                            as: "geofenceCoordinates",
                            required: false
                        },
                    ]
                }, 
                {
                    model: FarmCoordinates,
                    as: "FarmCoordinates",
                    required: false
                },
            ]
            },
            {
                model: DiligenceReport,
                required: true,
                attributes: [
                    'id','countryOfActivity','countryOfProduction'
                ],
                through: {
                    where: {
                        removed:false,
                        diligenceReportId
                    },
                }
            }
        ];
        const places =  await this.DueDiligenceProductionPlaceModel.findAll({
            where:{
                id:{
                    [Op.in]:productionPlaceIds
                },
            },
            attributes:['id', 'eudr_deforestation_status', 'warnings', 'risk_assessment_status'],
            include:includeParams
        });

        return places
    }

    getDdsReport = async (reportId:number) => {
        return await this.DiligenceReportModel.findOne({
          attributes:['id','countryOfActivity','countryOfProduction'],
          include:[
            {
                model: DiligenceReportAssessment,
                as: "diligenceReportAssessment",
                required: false
            },
          ],
          where:{
             id:reportId
          }
        }) 
    }

    getAllFarmCoordinateByFarmId = async (farmId:number) => {
        return await this.FarmCoordinateModel.findAll({
            attributes:['id','lat','log'],
            where:{
                farmId:farmId
            },
            order:[
                ['id','asc']
            ]
        })
    }

    createBatchForProductionPlaces = (productions:any[]) => {
        const BATCH_SIZE = 100;
        const totalProduction = productions.length
        const batches = [];
        for(let i = 0; i < totalProduction; i += BATCH_SIZE) {
            const batchData = productions.slice(i, i + BATCH_SIZE);
            batches.push(batchData);
        }
        return batches;
    }

    async checkIsFarmWithFarmCoordinates(farmId:number): Promise<Boolean> {
        const isCoordinate =  await this.FarmCoordinateModel.count({where:{farmId:farmId}})
        return isCoordinate > 1 ? true : false
    }

    acreToHecture(area){
        const rs =  Number(area)/2.47
        const toFixed =  rs.toFixed(2)
        return Number(toFixed)
    }

    async concludeReportNonComplaint(reportId:number){
       //Menthion All conditions  
       var deforestationStatusOtherThanZeroCount = 0
       var riskAssessmentStatusOtherThanZeroCount = 0
       var graterThanFourHectorCount = 0
       var farmCreatedInOceanCount = 0
       var farmCreatedInDifferentLocationCount = 0
       var geofenceNotCheckYetCount = 0

       const report = await this.getDdsReport(reportId)

       const eudrAllowedStatusForComplaint = [
           EudrDeforestationStatus.ZERO_NEG_PROBABILITY, 
           EudrDeforestationStatus.ZERO_NEGLIGIBLE_DEFORESTATION_PROBABILITY,
           EudrDeforestationStatus.MANUALLY_MITIGATED
       ]

       const productionPlaces = await this.getProductionPlacesByReports(Number(reportId))
       const placeIds = productionPlaces.map(x => x.productionPlace.id)


       if(report?.diligenceReportAssessment?.length) {
            for(let ast of report?.diligenceReportAssessment){
                const isAllApproveds = await this.getIsAllAssessmentStatusApproved(
                    report.id,
                    ast.assessment_id,
                    placeIds
                )
                if(!isAllApproveds){
                  riskAssessmentStatusOtherThanZeroCount += 1;
                }
            }    
        }

        for(const production of productionPlaces){
            if (!production?.productionPlaceDeforestationInfo || !eudrAllowedStatusForComplaint.includes(production?.productionPlaceDeforestationInfo?.deforestationStatus)) {
                deforestationStatusOtherThanZeroCount += 1;
            }
            

            const isFarmIsPolygon = await this.checkIsFarmWithFarmCoordinates(production?.farm?.id)
            if(!isFarmIsPolygon && this.acreToHecture(production?.farm?.area) > 4) {
                graterThanFourHectorCount += 1
            }
            // if(!production.warnings){
            //     geofenceNotCheckYetCount += 1 
            // }
            if(production?.productionPlace?.warnings){
                production?.productionPlace?.warnings.forEach(item => {
                    if(item?.is_ocean){
                        farmCreatedInOceanCount += 1  
                    }
                    if(report?.countryOfProduction?.length && (item?.country != report?.countryOfProduction[0])){
                        farmCreatedInDifferentLocationCount += 1  
                    }
                }) 
            }
         }
         return {
            deforestationStatusOtherThanZeroCount,
            riskAssessmentStatusOtherThanZeroCount,
            graterThanFourHectorCount,
            farmCreatedInOceanCount,
            farmCreatedInDifferentLocationCount,
            geofenceNotCheckYetCount
         }
    }

    async backgroundProcessWarningAndDssNonComplaint(reportId:number) {
        const productionPlaces = await this.getProductionPlacesByReports(Number(reportId))
        const productions = await Promise.all(
            productionPlaces.map(async (production) => {
                const coordinates = await this.getAllFarmCoordinateByFarmId(production?.farm?.id);
                const clone = JSON.parse(JSON.stringify(production))
                clone["farm"]["farmCoordinates"] = coordinates
                clone["farm"]["farmType"] = coordinates.length ? 'Polygon':"Point"
                return clone
            })
        );
        const isCompletedFailedJob = await this.jobService.findJobByModuleIDAndType({
            modelId: `${reportId}`,
            modelType: 'ProductionPlaceWarning'
        })
        if(!isCompletedFailedJob){
            const ddsReport = await this.getDdsReport(reportId)
            await this.jobService.create({
                payload: {
                    countryOfActivity:ddsReport.countryOfActivity,
                    countryOfProduction:ddsReport.countryOfProduction,
                    batches:this.createBatchForProductionPlaces(productions),
                    module: 'PRODUCTION_PLACE_WARNING',
                    command: 'PRODUCTION_PLACE_WARNING_RUN',
                },
                modelId: `${reportId}`,
                modelType: 'ProductionPlaceWarning',
            });
        }
        
        return productions
    }

    async warningProcessByProductionPlaces(productionPlacesIds:number[], diligenceReportId: number) {
       const productionPlaces = await this.getProductionPlacesByProductionIds(productionPlacesIds.map(x => x), diligenceReportId)
       if(!productionPlaces.length) return 
       const payload = productionPlaces.map((item, index) => {
            const {farm} = item
            if(farm?.FarmCoordinates.length){
                return  {
                    aoiId:item.id,
                    coordinates:farm.FarmCoordinates.map(y => {
                        return {
                            longitude:Number(y.log),
                            latitude:Number(y.lat)
                        }
                    })
                } 
            }else{
                return  {
                    aoiId:item.id,
                    radius:Number(farm?.GeoFences[0]?.geofenceRadius),
                    latitude:Number(farm?.GeoFences[0]?.geofenceCenterLat),
                    longitude:Number(farm?.GeoFences[0]?.geofenceCenterLog)
                } 
            }
       }) 

     

      const filteredPayload = payload.filter(x => {
        if(x?.coordinates && x?.coordinates.length){ return true }
        return x?.radius && x?.latitude && x?.longitude 
      })
      
      const batchSize = 50
      const totalSize = filteredPayload.length
      const batches = []
      for(let i = 0; i < totalSize; i += batchSize){
        const batchData = filteredPayload.slice(i, i+batchSize)
        batches.push(batchData)
      }
      for(let i = 0; i< batches.length; i++){
        const apiResponse = await this.httpRequestProductionPlaceWarning(batches[i])
        await this.updateProductionPlacesWithWarningInDB(productionPlaces[0].diligenceReports[0].countryOfProduction, apiResponse, diligenceReportId);
      }
      
    }

    async processAndStoreProductionPlaceWarning(job:any){
        job.status = JobStatus.Processing
        await job.save()
        const batches = job.payload.batches
        for(let i =0; i < batches.length; i++){
           const batchData = batches[i]
           const payload = batchData.map((item, index) => {
              const {farm} = item
              if(farm?.farmType == 'Polygun' || farm?.farmType == 'Polygon'){
                return  {
                    aoiId:item.id,
                    type:farm?.farmType,
                    coordinates:farm.farmCoordinates.map(y => {
                        return {
                            longitude:y.log,
                            latitude:y.lat
                        }
                    })
                 } 
              }else{
                return  {
                    aoiId:item.id,
                    type:farm?.farmType,
                    radius:farm.GeoFences[0].geofenceRadius,
                    latitude:farm.GeoFences[0].geofenceCenterLat,
                    longitude:farm.GeoFences[0].geofenceCenterLog
                 } 
              }
           })
           const apiResponse = await this.httpRequestProductionPlaceWarning(payload)
           await this.updateProductionPlacesWithWarningInDB(job.payload.countryOfProduction, apiResponse, Number(job.modelId))
        }
        job.status = JobStatus.Completed
        await job.save()
    }

    async updateProductionPlacesWithWarningInDB(countryOfProduction:[string] | any, apiResponse:any, reportId: number){
        const countryOfproduction = countryOfProduction && countryOfProduction.length ? countryOfProduction.map(x => x.toLowerCase()) : []
        const cases = []
        const ids = []
        apiResponse?.forEach(item => {
            const innerWarningBag = [{
                is_ocean:item.is_ocean,
                country:item.country,
            }]
            cases.push(`WHEN id = ${item?.aoiId} THEN '${JSON.stringify(
                innerWarningBag
            )}'`)
            ids.push(item?.aoiId)
       })
       let updateQuery = ''
       if(cases.length){
         updateQuery = `UPDATE due_diligence_production_places SET warnings = CASE ${cases.join(" ")} END WHERE id in (${ids.join(", ")})`;
         await this.sequelize.query(updateQuery)
         if(reportId) {
            updateQuery = `UPDATE diligence_reports_due_diligence_production_places SET warnings = CASE ${cases.join(" ")} END WHERE dueDiligenceProductionPlaceId in (${ids.join(", ")}) AND diligenceReportId = ${reportId}`;
            await this.sequelize.query(updateQuery)
         }
       } 
    }

    async httpRequestProductionPlaceWarning(body:any){
        const response = await withRetry(() =>
            axios.request({
              baseURL: process.env.DEFORESTATION_WARNING_URL || 'https://deforestation-api-dev.dimitra.dev',
              url: '/geofence-info-bulk',
              method: 'POST',
              headers: {
                'Auth-Token': process.env.DEFORESTATION_WARNING_TOKEN || "Kofj2lGvJXXT1P27y-qMqgpWyivbgtUpRMgZ2NQVbe7KjL21gvwKSSvWLIW3gCRDfYc",
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              data: {
                items:body
              },
            })
        ); 
        return response?.data?.data
    }

}