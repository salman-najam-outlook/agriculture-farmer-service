import {
    BadRequestException,
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    Logger,
    NotFoundException
} from "@nestjs/common";
import {InjectModel} from "@nestjs/sequelize";
import {Sequelize} from "sequelize-typescript";
import {Farm} from "src/farms/entities/farm.entity";
import {DueDiligenceProductionPlace, EudrDeforestationStatus, RiskAssessmentStatus} from "./entities/production-place.entity";
import * as turf from '@turf/turf';
import { kml as toGeoJSONKml } from '@tmcw/togeojson';
import { DOMParser } from 'xmldom';
import {
    CreateProductionPlacesInput,
    DueDiligenceProductionPlaceExtended,
    FarmType,
    ProducersFilterInput,
    ProducersPaginatedResponse,
    ProductionPlaceFilterInput,
    RemoveFarmArgs,
    RestoreFarmsArgs,
    RiskAssessmentStatusInput,
    UpdateEUDRDeforestationStatusInput,
    UpdateProductionPlacesInput,
    ProducerEditInput,
    ProducerAddInput
} from "./dto/create-production-place.input";
import { UserDDS as User } from "src/users/entities/dds_user.entity";
import {FarmCoordinates} from "src/farms/entities/farmCoordinates.entity";
import {FarmLocation} from "src/farms/entities/farmLocation.entity";
import {Geofence} from "src/geofence/entities/geofence.entity";
import {GeofenceCoordinates} from "src/geofence/entities/geofenceCoordinates.entity";
import {ApiCallHelper} from "src/helpers/api-call.helper";
import {RequestMethod} from "src/helpers/helper.interfaces";
import {S3Service} from "src/upload/upload.service";
import {RiskMitigationFiles} from "./entities/risk-mitigation-files.entity";
import {ProductionPlaceDisputes} from "./entities/production-place-dispute.entity";
import {ProductionPlaceDisputeComments} from "./entities/dispute-comment.entity";
import {HighRiskFarmMitigationInput, MitigateProductionPlaceInput, UpdateManuallyMitigationInput, UpdateRiskMitigationInput} from "./dto/risk-mitigation-file.input";
import {Op, WhereOptions} from "sequelize";
import {DEFAULT_AREA_IN_HECTOR, DEFAULT_RADIUS_IN_METER, HECTOR_TO_ACRE_FACTOR, URL, CONSTANT} from "src/config/constant";
import * as path from "path";
import * as fs from "fs";
import {parseStringPromise} from "xml2js";
import {DisputeCommentInput, DisputeStatus, ProductionPlaceDisputeFilterInput, ProductionPlaceDisputeInput, ProductionPlaceDisputePaginatedResponse, UpdateProductionPlaceDisputeInput} from "./dto/production-place-dispute.input";
import {DiligenceReport} from "src/diligence-report/entities/diligence-report.entity";
import {FarmUploadHistory} from "src/farms/entities/farm-upload-history.entity";
import { DeforestationReportRequest } from 'src/deforestation/entities/deforestation_report_request.entity';
import COUNTRIES from 'src/config/country';
import { DiligenceReportAssessment } from "src/diligence-report/entities/diligence-report-assessment.entity";
import { Assesment } from "src/assessment/entities/assessment.entity";
import { Job, JobStatus } from 'src/job/entities/job.entity';
import { BaseJobQueueable } from 'src/base-job-queueable';
import { JobService } from 'src/job/job.service';
import { MessageQueueingService } from "src/message-queueing/message-queueing.service";
import * as decompress from 'decompress';
import * as fsExtra from 'fs-extra';
import * as shapefile from 'shapefile';
import { EudrSetting } from "src/eudr-settings/entities/eudr-setting.entity";
import * as moment from "moment";
import { Roles } from "src/core/roles";
import * as uuid from 'uuid';
import { AssessmentProductionPlace } from "src/assessment-builder/entities/assessment-production-place.entity";
import { UsersDdsService } from "src/users/users-dds.service";
import { ManageProduct } from "../blend/manage-products/entities/manage-products.entity";
import { ProductionPlaceWarningService } from "src/due-diligence/production-place/production-place-warning.service"
import * as _ from 'lodash';
import { DiligenceReportProductionPlace } from 'src/diligence-report/entities/diligence-report-production-place.entity';
import { ProductionPlaceDeforestationInfo } from './entities/production-place-deforestation-info.entity';
import { DiligenceReportAssessmentSurveys } from 'src/diligence-report/entities/diligence-report-assessment-survey.entity';
import { getCoordinateHash } from 'src/helpers/coordinate.helper';
import { DiligenceReportPlaceMitigationFile } from 'src/diligence-report/entities/diligence-report-mitigation-file.entity';
import { AssessmentUploads } from 'src/assessment-builder/entities/assessment-uploads.entity';
import { AssessmentSurvey, SurveyStatus } from 'src/assessment-builder/entities/assessment-survey.entity';
import { ReportPlaceAssessmentProductionPlace } from 'src/diligence-report/entities/diligence-report-place-assessment-production-place.entity';
import { DueDiligenceProductionPlacesPyData } from "src/deforestation/entities/due_diligence_production_places_py_data.entity";
import { MailService } from "src/mail/mail.service";
import axios from "axios";
import { TranslationService } from "src/translation/translation.service";
import { DueDiligenceProductionManuallyMitigated } from "./entities/due-diligence-production-manually-mitigated.entity";

import * as ejs from "ejs";
import * as puppeteer from "puppeteer";
import * as csvParse from 'csv-parse/sync';
import * as XLSX from 'xlsx';
@Injectable()
export class ProductionPlaceService extends BaseJobQueueable {
    token:string = ''
    adminId:number | null = null

    constructor(
        private mailService: MailService,
        @InjectModel(User)private userModel : typeof User,
        @InjectModel(Farm)private farmModel : typeof Farm,
        @InjectModel(FarmUploadHistory)private farmUploadHistoryModel : typeof FarmUploadHistory,
        @InjectModel(FarmCoordinates)private farmCoordinateModel : typeof FarmCoordinates,
        @InjectModel(FarmLocation)private farmLocationModel : typeof FarmLocation,
        @InjectModel(Geofence)private geofenceModel : typeof Geofence,
        @InjectModel(GeofenceCoordinates)private geofenceCoordinateModel : typeof GeofenceCoordinates,
        @InjectModel(DueDiligenceProductionPlace)private productionPlaceModel : typeof DueDiligenceProductionPlace,
        @InjectModel(RiskMitigationFiles)private readonly riskMitigationFileModel : typeof RiskMitigationFiles,
        private apiCallHelper : ApiCallHelper,
        @Inject("SEQUELIZE")private readonly sequelize : Sequelize,
        @Inject(S3Service) private readonly s3Service: S3Service,
        @InjectModel(ProductionPlaceDisputes)private disputeModal : typeof ProductionPlaceDisputes,
        @InjectModel(ProductionPlaceDisputeComments)private disputeCommentModal : typeof ProductionPlaceDisputeComments,
        @InjectModel(DiligenceReport)private diligenceReportModal : typeof DiligenceReport,
        @InjectModel(DiligenceReportProductionPlace) private diligenceReportProductionPlaceModel: typeof DiligenceReportProductionPlace,
        @InjectModel(ProductionPlaceDeforestationInfo) private placeDeforestationInfo: typeof ProductionPlaceDeforestationInfo,
        @InjectModel(DiligenceReportAssessmentSurveys) private diligenceReportAssessmentSurveyModel: typeof DiligenceReportAssessmentSurveys,
        @InjectModel(DiligenceReportPlaceMitigationFile) private reportPlaceMitigationFileModel: typeof DiligenceReportPlaceMitigationFile,
        @InjectModel(DueDiligenceProductionManuallyMitigated) private dueDiligenceProductionManuallyMitigated: typeof DueDiligenceProductionManuallyMitigated,
        @InjectModel(DueDiligenceProductionPlacesPyData) private dueDiligenceProductionPyData: typeof DueDiligenceProductionPlacesPyData,
        @InjectModel(ProductionPlaceDeforestationInfo) private productionPlaceDeforestationInfoModel: typeof ProductionPlaceDeforestationInfo,
        @InjectModel(DeforestationReportRequest) private deforestationReportRequestModel : typeof DeforestationReportRequest,

        @Inject(forwardRef(() => JobService)) private jobService: JobService,
        private readonly messageQueueingService: MessageQueueingService,
        @InjectModel(EudrSetting)
        private EudrSettingModel: typeof EudrSetting,
        @InjectModel(ReportPlaceAssessmentProductionPlace)
        private ReportPlaceAssessmentProductionPlaceModel: typeof ReportPlaceAssessmentProductionPlace,
        @InjectModel(AssessmentUploads)
        private assessmentUploadModel: typeof AssessmentUploads,
        @InjectModel(AssessmentSurvey)
        private assessmentSurveyModel: typeof AssessmentSurvey,
        @InjectModel(AssessmentProductionPlace)
        private assessmentProductionPlaceService: typeof AssessmentProductionPlace,
        @InjectModel(DiligenceReportAssessment)
        private reportAssessmentModel: typeof DiligenceReportAssessment,
        private userService: UsersDdsService,
        private productionPlaceWarningService:ProductionPlaceWarningService,
        private readonly translationService: TranslationService,
        
    ) {
        super();
    }

    getUnexpiredDeforestationInfoId(deforestationInfo?: ProductionPlaceDeforestationInfo, eudrSetting?: EudrSetting): null | number {
        let infoId = null;
        if(eudrSetting?.dynamicExpiryTime && eudrSetting?.dynamicExpiryTimePeriod && deforestationInfo) {
            const deforestationDate = deforestationInfo.deforestationStatusDate;
            const expiryDate = moment(deforestationDate).add(eudrSetting.dynamicExpiryTime, eudrSetting.dynamicExpiryTimePeriod as moment.DurationInputArg2);
            const isExpired = expiryDate.isBefore(moment.now());
            if(!isExpired) infoId = deforestationInfo.id;
        }
        return infoId;
    }

    async attachAssessmentsToProductionPlace(diligenceReportId: number, productionPlaceIds: number[]) {
        const reportProductionPlaces = await this.diligenceReportProductionPlaceModel.findAll({
            where: {
                diligenceReportId,
                dueDiligenceProductionPlaceId: { [Op.in]: productionPlaceIds },
            },
            attributes: ['id', 'farmId', 'dueDiligenceProductionPlaceId'],
        });
        const reportAssessments = await this.reportAssessmentModel.findAll({
            where: {
                diligence_id: diligenceReportId,
                existing_survey: 'farmer',
            },
        });
        const farmIds = reportProductionPlaces.map(place => place.farmId);
        const assessmentIds = reportAssessments.map(item => item.assessment_id);
        const surveys = await this.assessmentSurveyModel.findAll({
            where: {
                assessmentId: { [Op.in]: assessmentIds },
                expiresOn: {
                    [Op.or]: [
                        {
                            [Op.gt]: new Date()
                        },
                        null,
                    ]
                },
                userFarmId: { [Op.in]: farmIds },
            },
            attributes: ['id', 'userFarmId', 'riskAssessmentStatus', 'expiresOn', 'assessmentId'],
        });
        await Promise.all(surveys.map(async survey => {
            const reportProductionPlace = reportProductionPlaces.find(place => place.farmId == survey.userFarmId);
            if(reportProductionPlace) {
                const existingReportSurvey = await this.diligenceReportAssessmentSurveyModel.findOne({
                    where: {
                        assessmentSurveyId: survey.id,
                        diligenceReportId,
                        diligenceReportProductionPlaceId: reportProductionPlace,
                    }
                });
                if(!existingReportSurvey) {
                    await this.diligenceReportAssessmentSurveyModel.create({
                        assessmentSurveyId: survey.id,
                        diligenceReportId,
                        diligenceReportProductionPlaceId: reportProductionPlace,
                    });
                }
                let assessmentPlace = await this.assessmentProductionPlaceService.findOne({
                    where: {
                        productionPlaceId: reportProductionPlace.dueDiligenceProductionPlaceId,
                        taggableType: 'surveys',
                        taggableId: survey.id,
                        assessmentId: survey.assessmentId,
                    },
                    attributes: ['id'],
                });
                if(!assessmentPlace) {
                    assessmentPlace = await this.assessmentProductionPlaceService.create({
                        productionPlaceId: reportProductionPlace.dueDiligenceProductionPlaceId,
                        taggableType: 'surveys',
                        taggableId: survey.id,
                        assessmentId: survey.assessmentId,
                        expiryDate: survey.expiresOn,
                        riskAssessmentStatus: survey.riskAssessmentStatus,
                        diligenceReportId,
                    });
                }
                const reportPlaceAssessmentPlace = await this.ReportPlaceAssessmentProductionPlaceModel.findOne({
                    where: {
                        assessmentProductionPlaceId: assessmentPlace.id,   
                        diligenceReportProductionPlaceId: reportProductionPlace.id,
                    }
                });
                if(!reportPlaceAssessmentPlace) await this.ReportPlaceAssessmentProductionPlaceModel.create({
                    assessmentProductionPlaceId: assessmentPlace.id,   
                    diligenceReportProductionPlaceId: reportProductionPlace.id,
                });
            }
        }));
    }

    async attachProductionPlaceToDiligenceReport(diligenceReportId: number, placeIds: number[], eudrSetting?: EudrSetting) {
        if(placeIds.length) {
            const places = await this.productionPlaceModel.findAll({
                where: { id: { [Op.in]: placeIds } },
                attributes: ['id', 'farmId', 'productionPlaceDeforestationInfoId', 'latestGeofenceId'],
                include: [
                    {
                        model: ProductionPlaceDeforestationInfo,
                        attributes: ['id', 'deforestationStatusDate']
                    },
                    {
                        model: Geofence,
                        attributes: ['coordinateHash'],
                    }
                ],
            });
            const existingDiligenceReportProductionPlaces = await this.diligenceReportProductionPlaceModel.findAll({
                where: {
                    dueDiligenceProductionPlaceId: { [Op.in]: placeIds },
                    diligenceReportId,
                },
                attributes: ['dueDiligenceProductionPlaceId', 'id', 'farmId'],
            });
            const newPlaces = places.filter(place => {
                const duplicates = places.filter(item => item.latestGeofence.coordinateHash == place.latestGeofence.coordinateHash);
                const duplicatePlaceIds = duplicates.map(item => item.id.toString());
                const exists = existingDiligenceReportProductionPlaces.find(item => duplicatePlaceIds.includes(item.dueDiligenceProductionPlaceId.toString()));
                if(exists) return false;

                return duplicates[duplicates.length - 1] == place;
            });
            await Promise.all(existingDiligenceReportProductionPlaces.map(async reportPlace => {
                const place = places.find(item => item.id == reportPlace.dueDiligenceProductionPlaceId);
                if(place && !reportPlace.productionPlaceDeforestationInfoId) {
                    reportPlace.productionPlaceDeforestationInfoId = this.getUnexpiredDeforestationInfoId(place.productionPlaceDeforestationInfo, eudrSetting);
                    await reportPlace.save();
                }
                return true;
            }));
            await this.diligenceReportProductionPlaceModel.bulkCreate(newPlaces.map(place => {
                return  {
                    farmId: place.farmId,
                    diligenceReportId,
                    dueDiligenceProductionPlaceId: place.id,
                    geofenceId: place.latestGeofenceId,
                    productionPlaceDeforestationInfoId: this.getUnexpiredDeforestationInfoId(place.productionPlaceDeforestationInfo, eudrSetting),
                }
            }));

            await this.attachAssessmentsToProductionPlace(diligenceReportId, placeIds);

            await this.productionPlaceWarningService.warningProcessByProductionPlaces(placeIds, diligenceReportId)
        }
    }

    async createProductionPlaceFromExistingPlace(createProductionPlaceInput: CreateProductionPlacesInput, eudrSetting?: EudrSetting) {
        const { dueDiligenceReportId } = createProductionPlaceInput;
        const placeIds = createProductionPlaceInput.productionPlaces.map(place => place.copyOf).filter(Boolean);
        await this.attachProductionPlaceToDiligenceReport(dueDiligenceReportId, placeIds, eudrSetting);
    }

    /**
  *
  * @param createProductionPlacesInput
  * @param token
  * @param userId
  * @returns
  */
    async createProductionPlace(createProductionPlacesInput : CreateProductionPlacesInput, token : string, userId : number, organizationId: number, subOrganizationId): Promise < Object > {
        try {
            const {dueDiligenceReportId, sourceType} = createProductionPlacesInput;
            const diligenceReport = await this.diligenceReportModal.findOne({
                where: {
                    id: dueDiligenceReportId
                },
            });
            if (! diligenceReport) {
                throw new NotFoundException("Diligence Report not found.");
            }
            diligenceReport.productionPlaceSource = sourceType;
            if(sourceType == 'manual'){
                diligenceReport.is_dds_status_update = false;
            }
            await diligenceReport.save();

            const eudrSetting = await this.EudrSettingModel.findOne({ where: { org_id: organizationId } });
            // Create Production Place from Existing Production Place
            if(sourceType  == 'existing'){
                await this.createProductionPlaceFromExistingPlace(createProductionPlacesInput, eudrSetting)
                return { success: true, message: "Successfully created production place." };
            }

            const cfFarmIds = [];
            const hashes = [];
            // Convert areas from hectares to acres for all farms in all production places
            createProductionPlacesInput.productionPlaces.forEach((productionPlace) => {
                productionPlace.farms.forEach((farm) => {
                    const hash = getCoordinateHash(farm.farmType === FarmType.POINT ? farm.pointCoordinates : farm.coordinates);
                    farm.coordinateHash = hash;
                    farm.area = farm.area * HECTOR_TO_ACRE_FACTOR; // Convert to acres
                    if(farm.farmId) {
                        cfFarmIds.push(farm.farmId);
                    } else if(hash) {
                        hashes.push(hash);
                    }
                });
            });

            const duplicatedFarms = await this.farmModel.findAll({
                where: { cf_farmid: { [Op.in]: cfFarmIds } },
                attributes: ['id', 'cf_farmid'],
                include: [
                    {
                        model: User,
                        as: "userDdsAssoc",
                        required: true,
                        attributes: ['id'],
                        where: { organization: organizationId },
                    },
                ]
            });

            const farms: Farm[] = [];
            duplicatedFarms.forEach(farm => {
                const exists = farms.find(item => item.cf_farmid == farm.cf_farmid);
                if(!exists) farms.push(farm);
            });

            const duplicatedGeofences = await this.geofenceModel.findAll({
                where: {
                    [Op.or]: [
                        { farmId: { [Op.in]: farms.map(farm => farm.id) } },
                        { coordinateHash: { [Op.in]: hashes } }
                    ]
                },
                include: [
                    {
                        model: Farm,
                        required: true,
                        attributes: ['id', 'cf_farmid'],
                        as: 'farmData',
                        include: [
                            {
                                model: User,
                                as: "userDdsAssoc",
                                required: true,
                                attributes: ['id'],
                                where: { organization: organizationId },
                            },
                        ]
                    }
                ],
                 order: [['id', 'DESC']],
            });
            const existingGeofences: Geofence[] = [];
            duplicatedGeofences.forEach(geofence => {
                const exists = existingGeofences.find(item => {
                    if(item.coordinateHash && geofence.coordinateHash) return item.coordinateHash === geofence.coordinateHash;
                    return false;
                });
                if(!exists) existingGeofences.push(geofence);
            });

            const existingFarmIds = existingGeofences.map(geofence => Number(geofence.farmId));
            const existingCfFarmIds = cfFarmIds.filter(id => {
                const farm = duplicatedFarms.find(farm => farm.cf_farmid == id);
                return farm && duplicatedGeofences.find(geofence => geofence.farmId == farm.id);
            });
            const existingHashes = existingGeofences.map(geofence => geofence.coordinateHash).filter(Boolean);
            const existingProductionPlaces = await this.productionPlaceModel.findAll({
                include: [
                    {
                        model: Geofence,
                        as: "latestGeofence"
                    }
                ],
                where: { farmId: { [Op.in]: existingFarmIds } }
            });

            for(let i = 0; i < existingProductionPlaces.length; i++) {
                const place = existingProductionPlaces[i]
                const geofence = existingGeofences.find(geofence => geofence.farmId == place.latestGeofence.farmId)

                if(geofence) {

                    let farm = null
                    createProductionPlacesInput.productionPlaces.forEach(incomingPlace =>{
                        incomingPlace.farms.forEach(incomingFarm => {
                            if(incomingFarm.farmId == geofence.farmData.cf_farmid) {
                                farm = incomingFarm
                            }
                        })
                    })

                    if(!farm || (geofence.coordinateHash == farm.coordinateHash))
                    {
                        continue
                    }
                        if (farm.farmType === FarmType.POINT) {
                            const pointCoordinates = {
                                geofenceCenterLat: farm.pointCoordinates.centerLatitude,
                                geofenceCenterLog: farm.pointCoordinates.centerLongitude,
                                geofenceRadius: parseFloat(farm.pointCoordinates.radius) ?? (farm?.area ?? diligenceReport.pointFarmDefaultArea) ? Math.pow(((Number(farm.area ?? diligenceReport.pointFarmDefaultArea)/HECTOR_TO_ACRE_FACTOR) * 10000)/Math.PI, 0.5) : DEFAULT_RADIUS_IN_METER
                            };
                               let farmGeofence = await this.geofenceModel.create({
                                    isPrimary: 1,
                                    farmId: geofence.farmId,
                                    userDdsId: geofence.userDdsId,
                                    ... pointCoordinates,
                                    generateMethod: "MANUAL",
                                    coordinateHash: getCoordinateHash(pointCoordinates),
                                     geofenceArea: farm?.area
                                });

                                place.latestGeofenceId = farmGeofence.id
                                await place.save()
                                 await this.farmModel.update({
                                   area: farm?.area
                                }, {
                                    where: {
                                        cf_farmid: farm.farmId
                                    }
                                });


                                // update deforestationStatusDate in production_place_deforestation_info table, so that it will trigger deforestation report for this new goefence next time we try to fetch deforestation report for this diligence report
                                let defoRepReqId = await this.deforestationReportRequestModel.findOne({
                                    where: {
                                        farm_id: geofence.farmId
                                    },
                                     order: [['id', 'DESC']],
                                })

                                const twoYearsAgo = new Date();
                                twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

                                await this.productionPlaceDeforestationInfoModel.update({
                                   deforestationStatusDate: twoYearsAgo
                                },{
                                    where: {
                                         deforestationReportRequestId: defoRepReqId.id
                                    }
                                })


                                
                                // diligenceReportProductionPlaceModel (diligence_reports_due_diligence_production_places) geofence id also, since deforestation report request job takes it from this table diligence_reports_due_diligence_production_places

                                await this.diligenceReportProductionPlaceModel.update({
                                    geofenceId: farmGeofence.id
                                }, {
                                    where: {
                                        farmId: geofence.farmId
                                    }
                                })
                                
                        } else if (farm.farmType === FarmType.POLYGON && farm.coordinates) {
                            const polygonCoordinates = farm.coordinates.map((coord) => ({lat: coord.latitude, log: coord.longitude, farmId: geofence.farmId, userDdsId: geofence.userDdsId}));

                            // update farm coordinates;
                            await this.farmCoordinateModel.destroy({
                                where: {
                                    farmId: geofence.farmId
                                },
                            });

                            await this.farmCoordinateModel.bulkCreate(polygonCoordinates);

                            // create new geofencecoordinates;

                             let farmGeofence = await this.geofenceModel.create({
                                farmId: geofence.farmId,
                                isPrimary: 1,
                                generateMethod: "MANUAL",
                                coordinateHash: getCoordinateHash(polygonCoordinates),
                                geofenceArea: farm?.area
                            });
                            const geofenceCoordinates = farm.coordinates.map((coord) => ({geofenceId: farmGeofence.id, lat: coord.latitude, log: coord.longitude}));
                            await this.geofenceCoordinateModel.bulkCreate(geofenceCoordinates);
                             place.latestGeofenceId = farmGeofence.id
                              await place.save()
                               await this.farmModel.update({
                                   area: farm?.area
                                }, {
                                    where: {
                                        cf_farmid: farm.farmId
                                    }
                                });

                                        // update deforestationStatusDate in production_place_deforestation_info table, so that it will trigger deforestation report for this new goefence next time we try to fetch deforestation report for this diligence report
                                let defoRepReqId = await this.deforestationReportRequestModel.findOne({
                                    where: {
                                        farm_id: geofence.farmId
                                    },
                                     order: [['id', 'DESC']],
                                })

                                const twoYearsAgo = new Date();
                                twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

                                await this.productionPlaceDeforestationInfoModel.update({
                                   deforestationStatusDate: twoYearsAgo
                                },{
                                    where: {
                                         deforestationReportRequestId: defoRepReqId.id
                                    }
                                })


                                
                                // diligenceReportProductionPlaceModel (diligence_reports_due_diligence_production_places) geofence id also, since deforestation report request job takes it from this table diligence_reports_due_diligence_production_places

                                
                                await this.diligenceReportProductionPlaceModel.update({
                                    geofenceId: farmGeofence.id
                                }, {
                                    where: {
                                        farmId: geofence.farmId
                                    }
                                })
                        }
                }
            }


            const placePayload = [];

            
            existingGeofences.forEach(geofence => {
                const place = existingProductionPlaces.find(place => place.farmId == geofence.farmId);
                if(!place) placePayload.push({ farmId: geofence.farmId, latestGeofenceId: geofence.id, dueDiligenceReportId, });
            });

            createProductionPlacesInput.productionPlaces = createProductionPlacesInput.productionPlaces.filter(place => {
                place.farms = place.farms.filter(farm => {
                    if(!farm.farmId) return true;
                    return !existingCfFarmIds.includes(farm.farmId) && !existingHashes.includes(farm.coordinateHash)
                });
                return place.farms.length > 0;
            });


            // To store created farms with their corresponding indices
            const createdFarmsMap = new Map();

            console.log(`Creating production places for diligence report: ${dueDiligenceReportId} ---------------`);

            for (const [placeIndex, createProductionPlaceInput] of createProductionPlacesInput.productionPlaces.entries()) {
                let { producerName, producerCountry, farms } = createProductionPlaceInput;
                const {firstName, lastName} = this.extractFirstAndLastName(producerName);
                const userPayload = {
                    firstName: firstName,
                    lastName: lastName,
                    countryId: producerCountry,
                    organization: organizationId,
                    subOrganizationId: subOrganizationId,
                };
                const user = await this.createOrFetchUser(userPayload);

                console.log(`Creating production place for user: ${user.firstName} ${user.lastName} (${user.id}) ---------------
                    -------------------------------------
                    `);

                // Create farm;
                if (farms && farms.length > 0) {
                    const farmPayload = farms.map((farm) => {
                        let latitude: string,
                            longitude: string;

                        if (farm.farmType === FarmType.POINT) {
                            ({ centerLatitude: latitude, centerLongitude: longitude } = farm.pointCoordinates);
                        } else if (farm.farmType === FarmType.POLYGON && farm.coordinates.length > 0) {
                            ({ latitude, longitude } = farm.coordinates[0]);
                        }

                        return {
                            farmName: farm.farmName,
                            area: (farm.farmType === FarmType.POINT && !farm.area) ? (DEFAULT_AREA_IN_HECTOR * HECTOR_TO_ACRE_FACTOR) : farm.area, // if area is not provided for POINT type then set 4ha by default,  // if area is not provided for POINT type then set 4ha by default;
                            userDdsId: user.id, // dds user isolation
                            address: farm.location,
                            lat: latitude,
                            log: longitude,
                            cf_farmid:farm?.farmId,
                            registrationNo:farm?.registrationNo,
                            farmerRegId:farm?.farmerRegId,
                            country: producerCountry // Ensure country is included
                        };
                    });

                    const createdFarms = await this.farmModel.bulkCreate(farmPayload,{
                        updateOnDuplicate: ['farmName', 'cf_farmid'],
                        returning: true
                    });
                    // Log each created farm
                    createdFarms.forEach(farm => {
                        console.log(`[FARM CREATED] id=${farm.id}, name=${farm.farmName}, userDdsId=${farm.userDdsId}, country=${farm.country}`);
                    });
                    createdFarmsMap.set(placeIndex, createdFarms);

                    // create FARM COORDINATES, FARM LOCATION, GEOFENCE, GEOFENCE CO ORDINATES
                    for (let i = 0; i < farms.length; i++) {
                        const farm = farms[i];
                        const createFarmLocationPayload = {
                            ...farm,
                            farmId: createdFarms[i]?.id,
                            userId: user.id,
                            generateMethod: farm.generateMethod
                              ? farm.generateMethod
                              : sourceType?.toLowerCase() === 'import'
                              ? 'FILE'
                              : sourceType?.toLowerCase() === 'manual'
                              ? 'MANUAL'
                              : null,
                          };
                        const geofence = await this.createFarmLocation(createFarmLocationPayload);
                        placePayload.push({
                            farmId: createdFarms[i].id,
                            latestGeofenceId: geofence.id,
                            dueDiligenceReportId,
                        });
                    }
                }
            }
            const newProductionPlaces = await this.productionPlaceModel.bulkCreate(placePayload, { returning: true });
            const placeIds = [...newProductionPlaces, ...existingProductionPlaces].map(place => place.id);
            await this.attachProductionPlaceToDiligenceReport(dueDiligenceReportId, placeIds, eudrSetting);
            await this.productionPlaceWarningService.warningProcessByProductionPlaces(placeIds, dueDiligenceReportId)

            if(!['coffee', 'cacao'].includes(sourceType)) {
                for (const [placeIndex, createProductionPlaceInput] of createProductionPlacesInput.productionPlaces.entries()) {
                    const { producerName, producerCountry, farms } = createProductionPlaceInput;

                    const { firstName, lastName } = this.extractFirstAndLastName(producerName);

                    const user = await this.userModel.findOne({
                        where: {
                            firstName: firstName,
                            lastName: lastName,
                            countryId: producerCountry
                        }
                    });

                    const createdFarms = createdFarmsMap.get(placeIndex);

                    for (const [index, farm] of farms.entries()) {
                        const {
                            farmName,
                            farmType,
                            location,
                            coordinates,
                            pointCoordinates
                        } = farm;

                        // Map coordinates to lat and log
                        const newCoordinates = coordinates ?. map((coord) => ({lat: coord.latitude, log: coord.longitude}));

                        let latitude: string,
                            longitude: string;

                        if (farm.farmType === FarmType.POINT) {
                            ({centerLatitude: latitude, centerLongitude: longitude} = farm.pointCoordinates);
                        } else if (farm.farmType === FarmType.POLYGON && farm.coordinates.length > 0) {
                            ({latitude, longitude} = farm.coordinates[0]);
                        }

                        // Create CF;
                        const cfFarmPayload = {
                            farmerFirstName: firstName,
                            farmerLastName: lastName,
                            countryId: producerCountry,
                            farmName: farmName,
                            area: (farm.farmType === FarmType.POINT && !farm.area) ? (DEFAULT_AREA_IN_HECTOR * HECTOR_TO_ACRE_FACTOR) : farm.area, // if area is not provided for POINT type then set 4ha by default
                            lat: latitude,
                            log: longitude,
                            address: location,
                            isTechnician: true,
                            technicianId: this.adminId,
                            //userId: user ?. cf_userid,
                            farmGeofenceType: farmType == FarmType.POINT ? "circular" : "polygon",
                            farmGeofenceRadius: pointCoordinates?.radius ?? farm.area ? Math.pow(((farm.area/HECTOR_TO_ACRE_FACTOR) * 10000)/Math.PI, 0.5) : DEFAULT_RADIUS_IN_METER,
                            farmGeofenceCenterLat: pointCoordinates?.centerLatitude,
                            farmGeofenceCenterLog: pointCoordinates?.centerLongitude,
                            farmGeofence: newCoordinates,
                            recordId: new Date().getTime(),
                            areaSyncFromDeforestation: true
                        };

                        try {
                            const data = (await this.createUserFarmInCF(cfFarmPayload, token))?.data;

                            if (data?.id) {
                                await this.farmModel.update({
                                    cf_farmid: data.id
                                }, {
                                    where: {
                                        id: createdFarms[index].id
                                    }
                                });
                            }

                            if (data ?. farm ?. userId) {
                                await this.userModel.update({
                                    cf_userid: data ?. farm ?. userId
                                }, {
                                    where: {
                                        id: user.id
                                    }
                                });
                            }
                        } catch (error) {
                            console.error(`Failed to create CF farm for ${farmName}: ${
                                error.message
                            }`);
                        }
                    }
                }
           }
            return {success: true, message: "Successfully created production place."};
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    /**
   * Edit production places
   * @param updateProductionPlaceInput
   * @param token
   * @param userId
   * @returns
   */
    async updateDueDiligenceReport(updateProductionPlaceInput : UpdateProductionPlacesInput, token : string, userId : number, organizationId: number): Promise < Object > {
        const diligenceReport = await this.diligenceReportModal.findByPk(updateProductionPlaceInput.dueDiligenceReportId);
        let t = await this.sequelize.transaction();
        try {
            const {
                id,
                dueDiligenceReportId,
                producerName,
                producerCountry,
                farms,
                isEdit
            } = updateProductionPlaceInput;
            const existingReportPlace = await this.diligenceReportProductionPlaceModel.findOne({
                where: {
                    dueDiligenceProductionPlaceId: id,
                    diligenceReportId: dueDiligenceReportId
                },
                include: [
                    {
                        model: DueDiligenceProductionPlace,
                        required: true,
                    }
                ]
            });

            if (! existingReportPlace) {
                throw new HttpException("Production place not found", HttpStatus.NOT_FOUND);
            }

            const farmDetails = await this.farmModel.findOne({
                where: {
                    id: existingReportPlace.farmId
                },
                include: [
                    {
                        model: Geofence,
                        as: "GeoFences",
                        required: false,
                        include: [
                            {
                                model: GeofenceCoordinates,
                                as: "geofenceCoordinates",
                                required: false
                            },
                        ],
                        where: {
                            isPrimary: 1
                        }
                    }, {
                        model: FarmCoordinates,
                        as: "FarmCoordinates",
                        required: false
                    }, {
                        model: User,
                        as: "userDdsAssoc",
                        required: false
                    },
                ],
            });
            const {firstName, lastName} = this.extractFirstAndLastName(producerName);

            const {
                farmName,
                area,
                location,
                farmType,
                coordinates,
                pointCoordinates,
                generateMethod,
            } = farms;

            let user;
            if (farmDetails) { // update the user if farm exists;
                existingReportPlace.isEdit = isEdit;
                await existingReportPlace.save();
                user = await this.userModel.findOne({
                    where: {
                        id: farmDetails.userDdsId
                    },
                });

                if (user) {
                    user.firstName = firstName;
                    user.lastName = lastName;
                    user.countryId = producerCountry;
                    await user.save();
                }

                // update farm details here

                farmDetails.farmName = farms?.farmName;
                farmDetails.area = farms?.area.toString();
                farmDetails.address = farms?.location;
                await farmDetails.save();
                let farmGeofence = farmDetails.GeoFences[0];
                if (farms?.geofenceId) {
                    const existing = await this.geofenceModel.findOne({
                        where: { id: farms.geofenceId, farmId: farmDetails.id },
                        include: [ { model: GeofenceCoordinates, as: 'geofenceCoordinates', required: false } ]
                    });
                    if (existing) farmGeofence = existing;
                }

                if (farms.farmType === FarmType.POINT) {
                    const pointCoordinates = {
                        geofenceCenterLat: farms.pointCoordinates.centerLatitude,
                        geofenceCenterLog: farms.pointCoordinates.centerLongitude,
                        geofenceRadius: parseFloat(farms.pointCoordinates.radius) ?? (farms?.area ?? diligenceReport.pointFarmDefaultArea) ? Math.pow(((Number(farms.area ?? diligenceReport.pointFarmDefaultArea)/HECTOR_TO_ACRE_FACTOR) * 10000)/Math.PI, 0.5) : DEFAULT_RADIUS_IN_METER
                    };
                    const hash = getCoordinateHash(pointCoordinates);
                    if(!farmGeofence || hash !== farmGeofence.coordinateHash) {
                        farmGeofence.isPrimary = 0;
                        await farmGeofence.save();
                        farmGeofence = await this.geofenceModel.create({
                            isPrimary: 1,
                            farmId: farmDetails.id,
                            userDdsId: user.id,
                            ... pointCoordinates,
                            generateMethod,
                            coordinateHash: getCoordinateHash(pointCoordinates),
                        });
                    }
                } else if (farms.farmType === FarmType.POLYGON && farms.coordinates) {
                    const polygonCoordinates = farms.coordinates.map((coord) => ({lat: coord.latitude, log: coord.longitude, farmId: farmDetails.id, userDdsId: user.id}));

                    // update farm coordinates (canonical farm polygon for map overlays)
                    await this.farmCoordinateModel.destroy({ where: { farmId: farmDetails.id }, });
                    await this.farmCoordinateModel.bulkCreate(polygonCoordinates);

                    // Upsert on the chosen geofence (by farms.geofenceId if provided, else current primary)
                    const hash = getCoordinateHash(polygonCoordinates);
                    if(!farmGeofence){
                        // no geofence found: create new
                        farmGeofence = await this.geofenceModel.create({
                            farmId: farmDetails.id,
                            isPrimary: 1,
                            generateMethod,
                            coordinateHash: hash,
                        });
                    } else {
                        farmGeofence.isPrimary = 1;
                        farmGeofence.geofenceRadius = null; 
                        farmGeofence.generateMethod = generateMethod;
                        farmGeofence.coordinateHash = hash;
                        await farmGeofence.save();
                    }

                    // If FE sent coordinate ids, update existing ones, remove missing, and create new
                    const incoming = farms.coordinates;
                    const incomingIds = incoming.map(c => c.id).filter(Boolean);
                    const existingCoords = await this.geofenceCoordinateModel.findAll({ where: { geofenceId: farmGeofence.id } });
                    const existingIds = existingCoords.map(c => Number(c.id));

                    // Delete coordinates that are not present in incomingIds (only if ids provided)
                    if (incomingIds.length) {
                        const toDelete = existingIds.filter(id => !incomingIds.includes(id));
                        if (toDelete.length) await this.geofenceCoordinateModel.destroy({ where: { id: { [Op.in]: toDelete } } });
                    } else {
                        // If no ids provided, replace entire set
                        await this.geofenceCoordinateModel.destroy({ where: { geofenceId: farmGeofence.id } });
                    }

                    // Upsert incoming coords
                    for (const coord of incoming) {
                        if (coord.id) {
                            await this.geofenceCoordinateModel.update({ lat: coord.latitude, log: coord.longitude }, { where: { id: coord.id, geofenceId: farmGeofence.id } });
                        } else {
                            await this.geofenceCoordinateModel.create({ geofenceId: farmGeofence.id, lat: coord.latitude, log: coord.longitude });
                        }
                    }
                }

                existingReportPlace.geofenceId = farmGeofence.id;
                await existingReportPlace.save();
                existingReportPlace.productionPlace.latestGeofenceId = farmGeofence.id;
                await existingReportPlace.productionPlace.save();
                const infoIds = [
                    existingReportPlace.productionPlaceDeforestationInfo,
                    existingReportPlace.productionPlace.productionPlaceDeforestationInfo
                ].filter(Boolean);
                if(infoIds.length) {
                    await this.placeDeforestationInfo.update({
                        deforestationReportRequestId: null,
                        deforestationMitigationComment: null,
                        deforestationStatus: null,
                        originalDeforestationStatus: null,
                        deforestationStatusDate: null,
                        lastDeforestationMitigationDate: null,
                        lastDisputeResolvedDate: null,
                    }, {
                        where: { id: { [Op.in]: infoIds } } 
                    });
                }
            } else { // create farm;
                const userPayload = {
                    firstName,
                    lastName,
                    countryId: producerCountry,
                    organization: organizationId
                };

                user = await this.createUser(userPayload);

                const newFarmPayload = {
                    farmName: farms.farmName,
                    area: farms.farmType === FarmType.POINT && !farms.area ? (diligenceReport.pointFarmDefaultArea ?? 4) * HECTOR_TO_ACRE_FACTOR : farms.area,
                    userDdsId: user.id, // user isolation for dds
                    address: farms.location,
                    lat: farms.farmType === FarmType.POINT ? farms.pointCoordinates.centerLatitude : farms.coordinates[0].latitude,
                    log: farms.farmType === FarmType.POINT ? farms.pointCoordinates.centerLongitude : farms.coordinates[0].longitude
                };
                const newFarm = await this.farmModel.create(newFarmPayload);

                await this.productionPlaceModel.update({
                    farmId: newFarm.id
                }, {
                    where: {
                        id
                    },
                });

                if (farms.farmType === FarmType.POINT) {
                    const pointCoordinates = {
                        geofenceCenterLat: farms.pointCoordinates.centerLatitude,
                        geofenceCenterLog: farms.pointCoordinates.centerLongitude,
                        geofenceRadius: farms.pointCoordinates.radius ?? (farms.area ?? diligenceReport.pointFarmDefaultArea) ? Math.pow((((farms.area ?? diligenceReport.pointFarmDefaultArea)/HECTOR_TO_ACRE_FACTOR) * 10000)/Math.PI, 0.5) : DEFAULT_RADIUS_IN_METER,
                    };

                    await this.geofenceModel.create({
                        farmId: newFarm.id,
                        userDdsId: user.id,
                        ... pointCoordinates,
                        generateMethod,
                        coordinateHash: getCoordinateHash(pointCoordinates),
                    });
                } else if (farms.farmType === FarmType.POLYGON && farms.coordinates) {
                    const polygonCoordinates = farms.coordinates.map((coord) => ({lat: coord.latitude, log: coord.longitude, farmId: newFarm.id, userDdsId: user.id}));

                    await this.farmCoordinateModel.bulkCreate(polygonCoordinates);

                    // create geofence
                    const geofencePayload = {
                        userDdsId: user.id,
                        farmId: newFarm.id,
                        geofenceArea: farms.area,
                        isPrimary: 1,
                        generateMethod,
                        coordinateHash: getCoordinateHash(polygonCoordinates),
                    };

                    const geofence = await this.geofenceModel.create(geofencePayload);

                    const geofenceCoordinates = farms.coordinates.map((coord) => ({geofenceId: geofence.id, lat: coord.latitude, log: coord.longitude}));

                    await this.geofenceCoordinateModel.bulkCreate(geofenceCoordinates);
                }
            }            

            // Sync with CF data;
            // Map coordinates to lat and log
            const newCoordinates = coordinates?.map((coord) => ({lat: coord.latitude, log: coord.longitude}));

            let latitude: string,
                longitude: string;

            if (farmType === FarmType.POINT) {
                ({centerLatitude: latitude, centerLongitude: longitude} = pointCoordinates);
            } else if (farmType === FarmType.POLYGON) {
                ({latitude, longitude} = coordinates[0]);
            }

            await this.productionPlaceWarningService.warningProcessByProductionPlaces([id], dueDiligenceReportId)

            if (farmDetails.cf_farmid) {
                const cfFarmPayload = {
                    id: farmDetails.cf_farmid,
                    farmerFirstName: firstName,
                    farmerLastName: lastName,
                    countryId: producerCountry,
                    farmName: farmName,
                    area: (farmType === FarmType.POINT && !area) ? ((diligenceReport.pointFarmDefaultArea ?? 4) * HECTOR_TO_ACRE_FACTOR) : area, // if area is not provided for POINT type then set 4ha by default
                    lat: farmType === FarmType.POINT ? pointCoordinates ?. centerLatitude : latitude,
                    log: farmType === FarmType.POLYGON ? pointCoordinates ?. centerLongitude : longitude,
                    address: location,
                    userId: user ?. cf_userid,
                    farmGeofenceType: farmType == FarmType.POINT ? "circular" : "polygon",
                    // if farmtype polygon;
                    farmGeofence: newCoordinates,
                    recordId: new Date().getTime(),
                    areaSyncFromDeforestation: true
                };

                await this.updateUserFarmInCF(cfFarmPayload, token);
            }
            return {success: true, message: "Successfully updated the production places."};
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
   *
   * @param creatCFFarmInput
   * @param token
   * @param t
   * @returns
   */
    createUserFarmInCF = async (creatCFFarmInput : any, token : string) => {
        try { // Create CF User here
            const endpoint = URL.CF_BASEURL + "/admin/farm";

            console.log('CREATED FARM IN CF');
            console.log("endpoint", endpoint)
            const response = await this.apiCallHelper.call(RequestMethod.POST, endpoint, {
                "content-type": "application/json",
                "oauth-token": token
            }, creatCFFarmInput);
            return response?.data;
        } catch (error) {
            console.log(error);
            return {};
        }
    };

    updateUserFarmInCF = async (updateCFFarmInput : any, token : string) => {
        try { // Update CF data here
            const endpoint = URL.CF_BASEURL + "/admin/farm";

            const response = await this.apiCallHelper.call(RequestMethod.PUT, endpoint, {
                "content-type": "application/json",
                "oauth-token": token
            }, updateCFFarmInput);
            return response?.data;
        } catch (error) {
            console.log(error);
            return {};
        }
    };

    /**
   *
   * @param createFarmLocationInput
   * @param t
   */
    createFarmLocation = async (createFarmLocationInput : any) => {
        const {
            area,
            userId,
            farmId,
            pointCoordinates,
            coordinates,
            farmType,
            generateMethod,
            coordinateHash,
        } = createFarmLocationInput;
        try {
            let locationData = await this.farmLocationModel.findOne({
                where: {
                    farmId: farmId,
                    isDeleted: 0,
                    isPrimary: 1
                }
            });

            const farmLocationPayload = {
                isPrimary: 1,
                area: area ?? 0,
                userDdsId: userId,
                recordId: new Date().getTime(),
                farmId,
            };
            if(!locationData){
                locationData = await this.farmLocationModel.create(farmLocationPayload);
            }
            
            let geofenceRes = await this.geofenceModel.findOne({where:{farmLocationId:locationData.id}})

            if (farmType === FarmType.POINT && pointCoordinates) {
                const {radius: geofenceRadius, centerLatitude, centerLongitude} = pointCoordinates;
                const geofencePayload = {
                    farmLocationId: locationData ?. id,
                    userDdsId: userId,
                    farmId,
                    geofenceArea: area,
                    geofenceRadius: geofenceRadius || DEFAULT_RADIUS_IN_METER,
                    geofenceCenterLat: centerLatitude,
                    geofenceCenterLog: centerLongitude,
                    isPrimary: 1,
                    generateMethod,
                    coordinateHash,
                };
                
                if(!geofenceRes){
                    geofenceRes = await this.geofenceModel.create(geofencePayload);
                }
            } else if (farmType === FarmType.POLYGON && coordinates) {
                const geofencePayload = {
                    farmLocationId: locationData ?. id,
                    userDdsId: userId,
                    farmId,
                    geofenceArea: area,
                    isPrimary: 1,
                    generateMethod,
                    coordinateHash,
                };

                if(!geofenceRes) {
                    geofenceRes = await this.geofenceModel.create(geofencePayload);
                }
                  
                const polygonPayloads = coordinates.map((element : any) => ({
                    geofenceId: geofenceRes ?. id,
                    lat: element.latitude,
                    log: element.longitude
                }));

                await this.geofenceCoordinateModel.bulkCreate(polygonPayloads, {
                    updateOnDuplicate:['geofenceId'],
                });

                // Create user farm coordinates here
                const coordinatePayload = coordinates.map((coord) => ({farmId: farmId, lat: coord.latitude, log: coord.longitude, userDdsId: userId}));

                await this.farmCoordinateModel.bulkCreate(coordinatePayload, {
                    updateOnDuplicate:['farmId'],
                });
            }
            return geofenceRes;
        } catch (error) {
            console.log(error.message);
        }
    };


    /**
   *
   * @param payload
   * @param t
   * @returns
   */
    async createUser(payload : any) {
        return await this.userModel.create(payload);
    }

    async createOrFetchUser(payload:any) {
       const user =  await this.userModel.findOne({
            where:{
            firstName:payload.firstName,
            lastName:payload.lastName,
            organization:payload.organization,
            ...(payload.subOrganizationId && {subOrganizationId: payload.subOrganizationId}), 
            }
       })
       if(user) return user 
       return await this.createUser(payload)   
    }

    async createBulkUser(bulkPayload:any) {
        return await this.userModel.bulkCreate(bulkPayload, {returning:true})
    }

    createProducerInCF = async (createProducerInput: any, token: string) => {
        try {
            const endpoint = `${URL.CF_BASEURL}/admin/dds_register`;
    
            Logger.log("Creating producer in CF with endpoint:", endpoint);
    
            const response = await this.apiCallHelper.call(RequestMethod.POST, endpoint, {
                "Content-Type": "application/json",
                "oauth-token": token,
            }, createProducerInput);
    
            return response?.data || {};
        } catch (error) {
            Logger.error("Error creating producer in CF:", error.message || error);
            throw new Error("Failed to create producer in CF");
        }
    };
    

    async addProducer(producer:ProducerAddInput, organizationId:number, userId: number, token: string,subOrganizationId?:number) {
        const cfProducerPayload = {
            firstName: producer.firstName, 
            lastName: producer.lastName, 
            email: producer.email, 
            mobile: producer.mobile, 
            countryId:producer.countryId,
            country:producer.countryId,
            countryIsoCode:producer.countryId,
            role:'producer'
        };
        try {
            const cfResponse = await this.createProducerInCF(cfProducerPayload, token);
            return this.userModel.create({ ...producer, active:true, role:'producer', organization:organizationId, subOrganizationId:subOrganizationId || null,  createdBy: userId }) 
            
        } catch (error) {
            throw new Error(`Failed to create producer: ${error.message || 'Unknown error'}`);
        }

    }

    async updateProducerInCF(id: number, updateProducerInput: any, token: string) {
        try {
            const endpoint = `${URL.CF_BASEURL}/admin/dds_update/${id}`;
    
            Logger.log("Updating producer in CF with endpoint:", endpoint);
    
            const response = await this.apiCallHelper.call(RequestMethod.PUT, endpoint, {
                "Content-Type": "application/json",
                "oauth-token": token,
            }, updateProducerInput);
    
            return response?.data || {};
        } catch (error) {
            Logger.error("Error updating producer in CF:", error.message || error);
            throw new Error("Failed to update producer in CF");
        }
    }

    async editProducer(producer:ProducerEditInput, token: string){
        const {id, ...rest} = producer

        const existingProducer = await this.userModel.findOne({ where: { id } });
        if (!existingProducer) {
            throw new Error(`Producer with ID ${id} does not exist`);
        }
    
        if (!existingProducer.cf_userid) {
            throw new Error(`Producer with ID ${id} is not registered in Connected Farmer`);
        }
    
        const producerPayload = {
            firstName: producer.firstName, 
            lastName: producer.lastName, 
            email: producer.email, 
            mobile: producer.mobile, 
            countryId:producer.countryId,
            country:producer.countryId,
            countryIsoCode:producer.countryId,
            role:'producer',
            id: Number(existingProducer.cf_userid)
        };

        await this.updateProducerInCF(existingProducer.cf_userid, producerPayload, token);

        return await this.userModel.update(rest, {
            where:{
                id:id
            }
        })   
    }

    async deactivateUser(id:number, token: string){
        const user = await this.userModel.findOne({ where: { id } });
        if (!user) {
            throw new Error(`User with ID ${id} not found`);
        }

        if (!user.cf_userid) {
            throw new Error(`User with ID ${id} does not have a valid CF user ID.`);
        }

        const newStatus = !user.active;

        const endpoint = `${URL.CF_BASEURL}/admin/dds_update/${user.cf_userid}`;
    
        Logger.log("Updating producer in CF with endpoint:", endpoint);

        const producerPayload = {
            id: Number(user.cf_userid),
            role:'producer',
            email: user.email, 
            mobile: user.mobile, 
            active: newStatus
        };

        try {
            const response = await this.apiCallHelper.call(RequestMethod.PUT, endpoint, {
                "Content-Type": "application/json",
                "oauth-token": token,
            }, producerPayload);
    
            return await this.userModel.update({ active: newStatus }, { where: { id } });
        }
        catch (error) {
            Logger.error("Failed to update producer in CF:", error.message);
            throw new Error("Error occurred while updating producer status.");
        }
    }

    async findAllProducers(filter: ProducersFilterInput, organizationId: number, userId: number,subOrganizationId?:number): Promise<ProducersPaginatedResponse> {
        const page = filter.page || 1;
        const limit = filter.limit || 10; 
        const offset = (page - 1) * limit;
        const query = { offset: 1, limit: 10 };
        if (page && limit) {
            query.offset = (page - 1) * limit;
            query.limit = limit;
          }

        const where = {
            organization: organizationId,
            ...(subOrganizationId && {subOrganizationId : subOrganizationId}),
            role:{
                [Op.in]:['producer','farmer']
            },
            countryId: null,
            firstName: null,
            lastName: null
        }
        
        let reportWhere:any = {
            organizationId,
            isDeleted: 0,
            ...(subOrganizationId && {subOrganizationId : subOrganizationId})
        };

        let searchWhere = {}

        if (filter?.supplierId) {
            const supplier = await this.userService.findByCfID(Number(filter.supplierId))
            reportWhere = {
                ...reportWhere,
                supplierId: supplier.id,
                sendToOperator: false,
                whoAddPlaceData: 'supplier'
            };

        }

        if (filter?.operatorId) {
            const operator = await this.userService.findByCfID(Number(filter.operatorId))
            reportWhere = {
                ...reportWhere,
                operatorId: operator.id,
                sendToOperator: true,
                whoAddPlaceData: 'operator'
            };
        }


        if (filter.country) {
           where.countryId = filter.country
        }

        if (filter.search) {
            const name = filter.search.split(" ");

            if (name.length > 1) {
                const [firstName, lastName, ..._] = name;

                where.firstName = {
                    [Op.like]: `%${firstName}%`
                }

                where.lastName = {
                    [Op.like]: `%${lastName}%`
                }
            } else {
                searchWhere[Op.or] = [
                    {
                        firstName: {
                            [Op.like]: `%${name[0]}%`
                        }
                    },
                    {
                        lastName: {
                            [Op.like]: `%${name[0]}%`
                        }
                    }
                ]
            }
        }

        for (const key in where) {
            if (where[key] === null) {
                delete where[key];
            }
        }

        const allRecords = await this.userModel.findAndCountAll({
            where: {
            ...where,
            
            [Op.and] : [
                { ...searchWhere },
                {
                    [Op.or]: [
                        { '$farms.productionPlace.diligenceReports.id$': { [Op.ne]: null } }, 
                        { createdBy: userId }, 
                    ],
                },
            ],
            },
            offset,
            limit,
            include: [
                {
                    model: Farm,
                    as: 'farms',
                    required: false,
                    include: [
                        {
                            model: DueDiligenceProductionPlace,
                            as: 'productionPlace',
                            required: false,
                            where: { removed: 0 },
                            include: [
                                // {
                                //     model: AssessmentProductionPlace,
                                //     required: false,
                                //     attributes: ['id', 'riskAssessmentStatus'],
                                //     as: 'all_risk_assessments',
                                // },
                                {
                                    model: DiligenceReport,
                                    as: 'diligenceReports',
                                    required: false,
                                    where: reportWhere,
                                },
                            ],
                        },
                    ],
                    subQuery: false,
                },
            ],
            order: [['id', 'DESC']],
            subQuery: false,
            distinct: true,
        });
            
        const totalCount = allRecords.count;

        const rows = allRecords.rows

        const totalPages = Math.ceil(totalCount / limit);

        return {
            totalCount,    
            count: totalPages,
            rows,  
        };
    }
    
    /**
   *
   * @param fullName
   * @returns
   */
    extractFirstAndLastName(fullName : string) {
        if(!fullName) return { firstName: '', lastName: '' };
        const lastIndex = fullName.lastIndexOf(" ");
        let firstName,
            lastName;

        if (lastIndex > 0) {
            firstName = fullName.slice(0, lastIndex);
            lastName = fullName.slice(lastIndex + 1);
        } else {
            firstName = fullName;
            lastName = "";
        }

        return {firstName, lastName};
    }

    /**
   *
   * @param dueDiligenceReport
   * @param file
   * @param userId
   * @param token
   * @returns
   */
  async processGeoJsonFile(
      diligenceReport: DiligenceReport,
      files: Express.Multer.File[],
      userId: number,
      dds_user: any,
      token: string
    ): Promise<Object> {
      this.adminId = Number(userId);
      const uploadDir = path.join(__dirname, './uploads');
      await fs.promises.mkdir(uploadDir, { recursive: true });
      let allFeatures: any[] = [];
      try {
        for (const file of files) {
            const s3Key = `productionplace-geojson-uploads/${diligenceReport.id}/${dds_user?.organization}/${userId}/${Date.now()}-${file.originalname}`;
            const s3UploadResult = await this.s3Service.s3_upload(
                file.buffer,
                process.env.GEO_JSON_BUCKET,
                s3Key,
                file.mimetype,
                true
            );
          const filePath = path.join(__dirname, './uploads', file.originalname);
          await fs.promises.writeFile(filePath, file.buffer);
          const geoJsonData = await fs.promises.readFile(filePath, 'utf8');
          const geoJson = JSON.parse(geoJsonData);
          if (geoJson.type === 'FeatureCollection' && Array.isArray(geoJson.features)) {
            allFeatures = allFeatures.concat(geoJson.features);
          }
          await fs.promises.unlink(filePath);
        }
        if (allFeatures.length === 0) {
          throw new Error('No features found in uploaded geojson files.');
        }
        const combinedGeoJson = { type: 'FeatureCollection', features: allFeatures };
        const job = await this.createJobForGeoJson(
          diligenceReport,
          combinedGeoJson,
          dds_user,
          token,
          userId
        );
        diligenceReport.productionPlaceSource = 'import';
        diligenceReport.status = 'Processing Farms';
        await diligenceReport.save();
        const jobData = job.toJSON();
        delete jobData.payload;
        return {
          success: true,
          job: jobData,
          message: 'Successfully imported production place.'
        };
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    /**
   *
   * @param diligenceReport
   * @param file
   * @param userId
   * @param token
   * @returns
   */
    async processXmlFile(diligenceReport: DiligenceReport, file : Express.Multer.File, userId : number, organizationId: number, token : string): Promise < Object > {
        const {
            originalname,
            buffer
        } = file;
        this.adminId = Number(userId)
        const uploadDir = path.join(__dirname, './uploads');
        await fs.promises.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(__dirname, "./uploads", originalname);

        try {
            await fs.promises.writeFile(filePath, buffer);
            const xmlData = await fs.promises.readFile(filePath, "utf8");
            const jsonData = await parseStringPromise(xmlData, {explictArray: false});

            const geoJson = this.convertXmlToGeoJsonFormat(jsonData);
            const job = await this.createJobForGeoJson(diligenceReport, geoJson, organizationId,token, Number(userId));
            await fs.promises.unlink(filePath);
            diligenceReport.productionPlaceSource = 'import';
            diligenceReport.status = 'Processing Farms';
            await diligenceReport.save();
            const jobData = job.toJSON();
            delete jobData.payload;
            return {
                success: true,
                job: jobData,
                message: "Successfully imported production place."
            };
        } catch (error) {
            throw new Error(error);
        }
    }

  /**
   *
   * @param dueDiligenceReport
   * @param file
   * @param userId
   * @param token
   * @returns
   */
  async processShapeFileZip(
    diligenceReport: DiligenceReport,
    file: Express.Multer.File,
    userId: number,
    organizationId: number,
    token: string,
  ): Promise<Object> {
    const { originalname, buffer } = file;
    const uploadDir = path.join(__dirname, './uploads');
    await fs.promises.mkdir(uploadDir, { recursive: true });
    const folderPath = path.join(uploadDir, originalname.split('.')[0]);
    await fs.promises.mkdir(folderPath, { recursive: true });

    try {
      const files = await decompress(buffer, folderPath);

      const shpFile = files.find((file) => file.path.endsWith('.shp'));
      const dbfFile = files.find((file) => file.path.endsWith('.dbf'));

      if (!shpFile || !dbfFile) {
        throw new Error('Shapefile components not found');
      }
      const geoJson = await shapefile.read(shpFile.data, dbfFile.data);

      const job = await this.createJobForGeoJson(
        diligenceReport,
        geoJson,
        organizationId,
        token,
        userId
      );
      await fsExtra.remove(folderPath);

      diligenceReport.productionPlaceSource = 'import';
      diligenceReport.status = 'Processing Farms';
      await diligenceReport.save();
      const jobData = job.toJSON();
      delete jobData.payload;
      return {
        success: true,
        job: jobData,
        message: 'Successfully imported production place.',
      };
    } catch (error) {
      throw new Error(error);
    }
  }
    /**
   *
   * @param xmlData
   * @returns
   */
    convertXmlToGeoJsonFormat(xmlData: any): any {
        const features = xmlData.root.features.map((feature) => {
            const properties = feature.properties;
            const geometryType = feature.geometry[0].type[0];
            const coordinates = feature.geometry[0].coordinates.map((coord) => [parseFloat(coord)]);

            const transformCoordinates = (coords) => {
                if (geometryType === 'Point') {
                    // For Point geometry, return the first two coordinates as [longitude, latitude]
                    return [parseFloat(coords[0]), parseFloat(coords[1])];
                } else if (geometryType === 'Polygon') {
                    // For Polygon, transform coordinates accordingly
                    let transformed = [];
                    for (let i = 0; i < coords.length; i += 2) {
                        transformed.push([coords[i][0], coords[i + 1][0]]);
                    }
                    return [transformed];
                }
            }

            return {
                type: "Feature",
                properties: {
                    ProducerName: properties[0].ProducerName[0],
                    ProducerCountry: properties[0].ProducerCountry[0],
                    ProductionPlace: properties[0].ProductionPlace[0]
                },
                geometry: {
                    type: geometryType,
                    coordinates: transformCoordinates(coordinates)
                }
            };
        });

        return { type: "FeatureCollection", features: features };
    }

    convertKmlToGeoJsonFormat(kmlData: string): any {
        const kml = new DOMParser().parseFromString(kmlData, 'text/xml');
        const geoJson = toGeoJSONKml(kml);
        return geoJson;
    }

    async createBulkFarmLocation(locationPayload:any) {
        const batchPayload = locationPayload.map(item => {
            let geofences = [];
            const type = item.type;
            if(type === 'Point' || type === 'MultiPoint') {
                const arrPointCoordinates = type === 'Point' ? [item.pointCoordinates] : item.pointCoordinates; 
                arrPointCoordinates.forEach((pointCoordinate, idx) => {
                    const { radius, centerLatitude, centerLongitude } = pointCoordinate;
                    geofences.push({
                        userDdsId: item.userDdsId,
                        farmId: item.farmId,
                        geofenceArea: item.area,
                        geofenceRadius: radius || DEFAULT_RADIUS_IN_METER,
                        geofenceCenterLat: centerLatitude,
                        geofenceCenterLog: centerLongitude,
                        isPrimary: idx === 0 ? 1 : 0,
                        generateMethod: item.generateMethod,
                        coordinateHash: pointCoordinate.coordinateHash || getCoordinateHash({ lat: centerLatitude, lng: centerLongitude, radius: radius || DEFAULT_RADIUS_IN_METER }),
                    });
                });
            } else if(type === 'Polygon' || type === 'MultiPolygon') {
                const arrPolygonCoordinates = type === 'Polygon' ? [item.coordinates] : item.coordinates;
                arrPolygonCoordinates.forEach((polygonCoordinate, idx) => {
                    geofences.push({
                        userDdsId: item.userDdsId,
                        farmId: item.farmId,
                        geofenceArea: polygonCoordinate.area,
                        isPrimary: idx === 0 ? 1 : 0,
                        generateMethod: item.generateMethod,
                        geofenceCoordinates: polygonCoordinate.coordinates.map((element) => {
                            return {
                                lat: element.latitude,
                                log: element.longitude,
                            }
                        }),
                        coordinateHash: polygonCoordinate.coordinateHash || getCoordinateHash(polygonCoordinate.coordinates),
                    });
                });
            }
            return {
                ...item,
                isPrimary: 1,
                isDeleted: 0,
                recordId: new Date().getTime(),
                geofences,
            }
        })

        await this.farmLocationModel.bulkCreate(batchPayload, {
            include:[{
                model:Geofence,
                as:'geofences',
                include:[
                    {
                        model:GeofenceCoordinates,
                        as:'geofenceCoordinates'
                    }
                ]
            }]
        });

    }

    adjustFirstLastCoord (coordinates:number[][]) {
      const cleanArray = coordinates.map(subArray => subArray.map(item => {
        return item;
      }));
       const getFirstCoord = cleanArray[0]
       const getLastCoord = cleanArray[cleanArray.length - 1]
       if(JSON.stringify(getFirstCoord) !=  JSON.stringify(getLastCoord)){
         coordinates.push(getFirstCoord)
       }
       return coordinates
    }

    getLongLatFromFeature(feature: any) {
        const { type, coordinates } = feature.geometry;
        let latitude: number, longitude: number;
        if(type === 'MultiPoint') {
            [longitude, latitude] = coordinates[0];
        } else if(type === 'MultiPolygon') {
            [longitude, latitude] = coordinates[0][0][0];
        } else if(type === 'Point') {
            [longitude, latitude] = coordinates;
        } else {
            [longitude, latitude] = coordinates[0][0];
        }
        return [longitude, latitude];
    }

    getAreaInAcreFromFeature(feature: any, defaultAreaInHa: number) {
        let area = 0;
        try {
            const { type, coordinates } = feature.geometry;
            const Area = feature.properties.Area;
            if(type === 'Point') {
                area = Area ? Area * HECTOR_TO_ACRE_FACTOR : defaultAreaInHa * HECTOR_TO_ACRE_FACTOR;
            } else if(type === 'MultiPoint') {
                area = (Area ? Area * HECTOR_TO_ACRE_FACTOR : defaultAreaInHa * HECTOR_TO_ACRE_FACTOR) * coordinates.length;
            } else if(type === 'MultiPolygon') {
                // Ensure each polygon in the MultiPolygon is closed (first and last coordinates are the same)
                const closedCoordinates = coordinates.map((polygon) => {
                    if (
                        Array.isArray(polygon[0]) &&
                        polygon[0].length > 0 &&
                        (
                            polygon[0][0][0] !== polygon[0][polygon[0].length - 1][0] ||
                            polygon[0][1][0] !== polygon[0][polygon[0].length - 1][1]
                        )
                    ) {
                        // If not closed, push the first coordinate to the end
                        return [
                            [
                                ...polygon[0],
                                polygon[0][0]
                            ]
                        ];
                    }
                    return polygon;
                });
                area = turf.area(turf.multiPolygon(closedCoordinates)) / 4046.86;
            } else {
                // Ensure the polygon is closed (first and last coordinates are the same)
                let polygonCoords = coordinates[0];
                if (
                    Array.isArray(polygonCoords) &&
                    polygonCoords.length > 0 &&
                    (
                        polygonCoords[0][0] !== polygonCoords[polygonCoords.length - 1][0] ||
                        polygonCoords[0][1] !== polygonCoords[polygonCoords.length - 1][1]
                    )
                ) {
                    polygonCoords = [...polygonCoords, polygonCoords[0]];
                }
                area = turf.area(turf.polygon([polygonCoords])) / 4046.86;
            }
            return parseFloat(area.toFixed(5));
        } catch (error) {
            console.error('Failed to calculate area from feature', error);
            return area;
        }
    }

    getAreaInAcreFromPolygon(polygon: any[]) {
        let area = 0;
        try {
            area = turf.area(turf.polygon(polygon)) / 4046.86;
            return parseFloat(area.toFixed(5));
        } catch (error) {
            console.error('Failed to calculate area from polygon', error);
            return area;
        }
    }

    extractProductionPlaceFromGeojson(feature: any, dds_user:any, defaultAreaInHa: number = 4) {
        let ProducerName: string, ProducerCountry: string, ProductionPlace: string, Address: string, Area: number;
        if(typeof feature.properties === 'object' && feature.properties) {
            Object.keys(feature.properties).forEach((key) => {
                if(key.toLowerCase() === 'producername') ProducerName = feature.properties[key];
                if(key.toLowerCase() === 'producercountry') ProducerCountry = feature.properties[key];
                if(key.toLowerCase() === 'productionplace') ProductionPlace = feature.properties[key];
                if(key.toLowerCase() === 'address') Address = feature.properties[key];
                if(key.toLowerCase() === 'area') Area = feature.properties[key];
            });
        }
        const {firstName, lastName} = this.extractFirstAndLastName(ProducerName);

        let { type, coordinates } = feature.geometry
        if (!Array.isArray(coordinates) && coordinates.length< 2) {
            throw new BadRequestException("Invalid coordinates format")
          } 
        let formattedFarmType = type === "Point" || type ==='MultiPoint' ? FarmType.POINT : FarmType.POLYGON;
        if (type === 'MultiLineString') {
            formattedFarmType = FarmType.POLYGON;
        }
        const [longitude, latitude] = this.getLongLatFromFeature(feature);

        //Payload For User
        const userPayload = {
            firstName: firstName || "",
            lastName: lastName || "",
            countryId: ProducerCountry || "",
            organization: dds_user?.organization,
            subOrganizationId: dds_user?.subOrganizationId || null,
        }

        //Payload For Farm
        const farmArea = this.getAreaInAcreFromFeature(feature, defaultAreaInHa);

        let farmCoordinates = [];
        if(type === 'Polygon') {
            farmCoordinates = coordinates[0].map((coord) => ({ farmId: null, lat: coord[1], log: coord[0], userDdsId: null }));
        } else if(type === 'MultiPolygon') {
            farmCoordinates = coordinates[0][0].map((coord) => ({ farmId: null, lat: coord[1], log: coord[0], userDdsId: null }));
        }

        const farmPayload = {
            farmName: ProductionPlace || " ",
            area: farmArea,
            userDdsId:null,
            address: Address || "",
            lat: latitude,
            log: longitude,
            FarmCoordinates: farmCoordinates,
            country: ProducerCountry || "",
        }

        let mainCoordinateHash = null;
        let geofencePolygonCoordinates;
        if(type === 'Polygon') {
            const coords = coordinates[0].map(coord => ({ latitude: coord[1], longitude: coord[0] }));
            mainCoordinateHash = getCoordinateHash(coords);
            geofencePolygonCoordinates = {
                coordinateHash: mainCoordinateHash,
                area: farmArea,
                coordinates: coordinates[0].map(coord => ({ latitude: coord[1], longitude: coord[0] }))
            };
        } else if(type === 'MultiPolygon') {
            geofencePolygonCoordinates = coordinates.map((polygonCoordinate, idx) => {
                const coords = polygonCoordinate[0].map(coord => ({ latitude: coord[1], longitude: coord[0] }));
                const hash = getCoordinateHash(coords);
                if(idx === 0) mainCoordinateHash = hash;
                return {
                    area: this.getAreaInAcreFromPolygon(polygonCoordinate),
                    coordinates: coords,
                    coordinateHash: getCoordinateHash(coords),
                }
            });
        }
        let geofencePointCoordinates;
        if(type === 'Point') {
            const radius = Math.pow(((Area || defaultAreaInHa) * 10000)/Math.PI, 0.5);
            mainCoordinateHash = getCoordinateHash({ lat: coordinates[1], lng: coordinates[0], radius });
            geofencePointCoordinates = {
                centerLatitude: coordinates[1], // coordinates[1] is latitude in GeoJSON [lng, lat] format
                centerLongitude: coordinates[0], // coordinates[0] is longitude in GeoJSON [lng, lat] format
                radius,
                coordinateHash: mainCoordinateHash,
            };
        } else if(type === 'MultiPoint') {
            const radius = Math.pow(((Area || defaultAreaInHa) * 10000)/Math.PI, 0.5);
            geofencePointCoordinates = coordinates.map((coord, idx) => {
                const hash = getCoordinateHash({
                    lat: coord[1], // coord[1] is latitude in GeoJSON [lng, lat] format
                    lng: coord[0], // coord[0] is longitude in GeoJSON [lng, lat] format
                    radius,
                });
                if(idx === 0) {
                    mainCoordinateHash = hash;
                }
                return {
                    centerLatitude: coord[1], // coord[1] is latitude in GeoJSON [lng, lat] format
                    centerLongitude: coord[0], // coord[0] is longitude in GeoJSON [lng, lat] format
                    radius,
                    coordinateHash: hash,
                }
            });
        }

        const locationPayload = {
            ...feature.properties,
            firstName:firstName,
            lastName:lastName,
            farmId: null,
            userDdsId: null,
            farmType: formattedFarmType,
            type,
            coordinates: geofencePolygonCoordinates,
            pointCoordinates: geofencePointCoordinates || null,
            area: farmArea,
            generateMethod: 'FILE',
        };
       
        return {
            ProducerName,
            ProducerCountry,
            ProductionPlace,
            userPayload,
            farmPayload,
            locationPayload,
            latitude,
            longitude,
            coordinateHash: mainCoordinateHash,
        }
    }

    createBatchForProductionPlaceImport(geojsonData: any, dds_user: any, defaultAreaInHa?: number) {
        const BATCH_SIZE = 100;
        const features = geojsonData.features;
        const totalFeatures = geojsonData.features.length;
        const batches = [];
        for(let i = 0; i < totalFeatures; i += BATCH_SIZE) {
            const batchData = features.slice(i, i + BATCH_SIZE).map(item => this.extractProductionPlaceFromGeojson(item, dds_user, defaultAreaInHa));
            batches.push(batchData);
        }

        return batches;
    }

    async importProductionPlaceFromJob(job: Job) {
        const batches = job.payload.batches;
        const length = batches.length;
        const eudrSetting = job.payload?.eudrSetting;
        if(!job.context) job.context = { completedBatchCount: 0 };
        if(!job.context.completedBatchCount) job.context.completedBatchCount = 0;
        const completedBatchCount = job.context.completedBatchCount;
        if(completedBatchCount === length) job.status = JobStatus.Completed;
        for (let i = completedBatchCount; i < length; i++) {
            const isLastBatch = i === (length - 1);
            const batch = batches[i];
            const hashes = batch.map(item => item.coordinateHash);
            const geofences = await this.geofenceModel.findAll({
                where: {
                    coordinateHash: { [Op.in]: hashes }
                },
                attributes: ['id', 'farmId', 'coordinateHash'],
                include: [
                    {
                        model: Farm,
                        required: true,
                        attributes: ['id'],
                        as: 'farmData',
                        include: [
                            {
                                model: User,
                                as: "userDdsAssoc",
                                required: true,
                                attributes: ['id'],
                                where: {
                                    organization: job.payload.organizationId,
                                    ...(job.payload.subOrganizationId ? { subOrganizationId: job.payload.subOrganizationId } : {}),
                                },
                            },
                        ]
                    }
                ],
            });
            const matchedHashes = geofences.map(geofence => geofence.coordinateHash);

            const unmatchedBatch = batch.filter(item => !matchedHashes.includes(item.coordinateHash));
            let createdGeofences: Geofence[] = [];
            let createdFarms: Farm[] = [];
            if(unmatchedBatch.length) {
                const userData = unmatchedBatch.map((item: any) => item.userPayload);
                const userIds = await this.createBulkUser(userData);

                const farmData = unmatchedBatch.map((item: any, idx: number) => {
                    const farmPayload = item.farmPayload;
                    farmPayload.userDdsId = userIds[idx].id;
                    farmPayload.FarmCoordinates = farmPayload.FarmCoordinates.map(item => ({
                        ...item,
                        userDdsId: userIds[idx].id
                    }));
                    return farmPayload;
                });

                try {
                    createdFarms = await this.farmModel.bulkCreate(farmData, {
                        include:[
                            {
                                model:FarmCoordinates,
                                as:'FarmCoordinates'
                            }
                        ],
                        returning: true,
                    });
                    // Log each created farm
                    createdFarms.forEach(farm => {
                        console.log(`[FARM CREATED] id=${farm.id}, name=${farm.farmName}, userDdsId=${farm.userDdsId}, country=${farm.country}`);
                    });
                } catch (error) {
                    console.error(`[CSV BULK] Farm creation failed: ${error.message}`, { error });
                    throw error;
                }

                const locationData = unmatchedBatch.map((item:any,idx:number) => {
                    let locationPayload = item.locationPayload;
                    locationPayload.userDdsId = userIds[idx].id;
                    locationPayload.farmId = createdFarms[idx].id;
                    locationPayload.area = createdFarms[idx].area;
                    return locationPayload;
                });
                await this.createBulkFarmLocation(locationData);
                createdGeofences = await this.geofenceModel.findAll({
                    where: {
                        farmId: { [Op.in]: createdFarms.map(farm => farm.id) },
                        isPrimary: true
                    },
                    attributes: ['id', 'farmId'],
                });
                await this.syncBatchDataInCFDB(locationData, job.payload.token, job.payload.adminId);
            }

            const matchedFarmIds = geofences.map(geofence => Number(geofence.farmId));
            const productionPlaceForFarmIds = await this.productionPlaceModel.findAll({
                where: {
                    farmId: { [Op.in]: matchedFarmIds }
                }
            });
            const nonExistingGeofences = geofences.filter(geofence => {
                const geofenceWithSameHash = geofences.filter(gf => gf.coordinateHash === geofence.coordinateHash);
                const geofenceFarmIds = geofenceWithSameHash.map(gf => gf.farmId.toString());
                return !productionPlaceForFarmIds.find(place => geofenceFarmIds.includes(place.farmId.toString()));
            });
            const productionPayload = [];
            createdFarms.forEach((farm) => {
                const geofence = createdGeofences.find(geofence => geofence.farmId == farm.id);
                productionPayload.push({ farmId: farm.id, dueDiligenceReportId: job.modelId, latestGeofenceId: geofence.id });
            });
            nonExistingGeofences.forEach((geofence) => productionPayload.push({ farmId: geofence.farmId, dueDiligenceReportId: job.modelId, latestGeofenceId: geofence.id }));
            const newPlaces = await this.productionPlaceModel.bulkCreate(productionPayload);
            const productionPlaceIds = [...newPlaces, ...productionPlaceForFarmIds].map(place => place.id);
            await this.attachProductionPlaceToDiligenceReport(Number(job.modelId), productionPlaceIds, eudrSetting);

            await this.productionPlaceWarningService.warningProcessByProductionPlaces(productionPlaceIds, Number(job.modelId))

            job.context = { ...job.context, completedBatchCount: job.context.completedBatchCount + 1 };
            job.status = isLastBatch ? JobStatus.Completed : this.shouldPause ? JobStatus.Pending : JobStatus.Processing;
            await job.save();
            if(this.shouldPause) break;
        }
        //await this.productionPlaceWarningService.backgroundProcessWarningAndDssNonComplaint(Number(job.modelId))
        if(job.status === JobStatus.Completed && job.modelId && job.modelType === 'DiligenceReport') {
            await this.diligenceReportModal.update({ status: 'Ready to Proceed', current_step: 3 }, { where: { id: job.modelId } });
            await this.sendFarmUploadNotification(job.modelId)
        }
    }

    async createJobForGeoJson(diligenceReport: DiligenceReport, geojsonData: any, dds_user: any, token:string, userId:number): Promise<Job> {
        try {
            this.token = token
            this.adminId  = Number(userId)
            const batches = this.createBatchForProductionPlaceImport(geojsonData, dds_user, diligenceReport.pointFarmDefaultArea);
            const eudrSetting = await this.EudrSettingModel.findOne({ where: { org_id: dds_user.organization } });
            const job = await this.jobService.create({
                payload: {
                    eudrSetting,
                    batches,
                    module: 'PRODUCTION_PLACE',
                    command: 'IMPORT',
                    status: diligenceReport.status,
                    token,
                    adminId: Number(userId),
                    organizationId: dds_user.organization,
                    subOrganizationId: dds_user.subOrganizationId || null,
                },
                modelId: diligenceReport.id.toString(),
                modelType: 'DiligenceReport',
            });
            return job;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async syncBatchDataInCFDB(batchesPayload: any[], token: string, adminId: number) {
        const payload  = batchesPayload.map((item) => {
            let coordinates = [];
            let segments = [];
            let radius = null;
            let { latitude, longitude } = item;
            if (item.type === 'Point' || item.type === 'MultiPoint') {
                const pointCoordinate = item.type === 'Point' ? item.pointCoordinates : item.pointCoordinates[0];
                [longitude, latitude, radius] = [pointCoordinate.centerLatitude, pointCoordinate.centerLongitude, pointCoordinate.radius || DEFAULT_RADIUS_IN_METER];
            } else if (item.type === 'Polygon' || item.type === 'MultiPolygon') {
                const firstCoordinates = item.type === 'Polygon' ? item.coordinates.coordinates : item.coordinates[0].coordinates;
                latitude = firstCoordinates[0].latitude;
                longitude = firstCoordinates[0].longitude;
                coordinates = firstCoordinates.map((coord) => ({ lat: coord.latitude, log: coord.longitude }));
            }

            if(item.type === 'MultiPoint') {
                item.pointCoordinates.forEach((coordinate, idx) => {
                    if(idx !== 0) {
                        segments.push({
                            coordinates: [],
                            geofenceArea: (Math.PI * Math.pow(coordinate.radius || DEFAULT_RADIUS_IN_METER, 2)) * 0.000247105,
                            geofenceParameter: 2 * Math.PI * (coordinate.radius || DEFAULT_RADIUS_IN_METER),
                            geofenceRadius: coordinate.radius || DEFAULT_RADIUS_IN_METER,
                            geofenceCenterLat: coordinate.centerLatitude,
                            geofenceCenterLog: coordinate.centerLongitude,
                            recordId: uuid.v4(),
                        });
                    }
                });
            } else if(item.type === 'MultiPolygon') {
                item.coordinates.forEach((coordinate, idx) => {
                    if(idx !== 0) {
                        segments.push({
                            coordinates: coordinate.coordinates.map((coord) => ({ lat: coord.latitude, log: coord.longitude })),
                            geofenceArea: coordinate.area,
                            recordId: uuid.v4(),
                        });
                    }
                });
            }
            const cfFarmPayload = {
                farmerFirstName: item.firstName,
                farmerLastName: item.lastName,
                countryId: item.ProducerCountry || "",
                farmName: item.ProductionPlace || "",
                area: item.area,
                lat: latitude,
                log: longitude,
                address: item.Address || "",
                isTechnician: true,
                technicianId:this.adminId,
                //technicianId: isFirstBatch && index === 0 ? item.userDdsId : null,
                //userId: item.userDdsId,
                userDDsID:item.userDdsId,
                farmGeofenceType: item.farmType === "POINT" ? "circular" : "polygon",
                farmGeofenceRadius: radius,
                farmGeofenceCenterLat: item.type === 'Point' || item.type === 'MultiPoint' ? latitude : null,
                farmGeofenceCenterLog: item.type === 'Point' || item.type === 'MultiPoint' ? longitude : null,
                farmGeofence: coordinates,
                segments,
                farmId: item.farmId,
                recordId: uuid.v4(),
                areaSyncFromDeforestation: true,
            };
            console.log('FARM PAYLOAD', JSON.stringify(cfFarmPayload));
            return cfFarmPayload;
        });
        const BATCH_SIZE = 5;
        const total = payload.length;

        for(let i = 0; i < total; i += BATCH_SIZE) {
            const batchData = payload.slice(i, i + BATCH_SIZE);
            await Promise.allSettled(
              batchData.map(async (item) => {
                const data = (await this.createUserFarmInCF(item, token))?.data;
                if (data?.id) {
                  await this.farmModel.update(
                    {
                      cf_farmid: data.id,
                    },
                    {
                      where: {
                        id: item.farmId,
                      },
                    }
                  );
                }

                if (data?.farm?.userId) {
                  await this.userModel.update(
                    {
                      cf_userid: data?.farm?.userId,
                    },
                    {
                      where: {
                        id: item.userDDsID,
                      },
                    }
                  );
                }
              })
            );
        }
    }

    async findAll(filter? : ProductionPlaceFilterInput, orgId?: number, context?: any,subOrganizationId?: number) {
        const page = filter.page;
        let limit = filter.limit;
        const query = {
            offset: 0,
            limit: 10
        };
        if (page && limit) {
            query.offset = (page - 1) * limit;
            query.limit = limit;
        }
        const userFilter: WhereOptions = {};
        if(orgId){
            userFilter.organization = { [Op.or]: [{ [Op.is]: null }, orgId] };
        }
        const cfRoles = filter?.cfRoles.split(',').map((role) => role.trim());
        const isOnlyExporter = cfRoles.length === 1 && cfRoles.some((role) => role == 'dds_exporter');
        if (!isOnlyExporter) {
            if (subOrganizationId) {
                userFilter.subOrganizationId = subOrganizationId;
            }
        }
        if (filter.farmOwner) {
            if (filter.farmOwner !== 'All Producers' && filter.farmOwner !== 'Unassigned' && filter.farmOwner !== '') {
                userFilter.firstName = { [Op.like]: `%${filter.farmOwner}%` };
            }
        }
        if (filter.farmerCountry) {
            const countryCodes = [];
            filter.farmerCountry.forEach((countryName) => {
                if (countryName === 'All Country' || countryName === 'Unassigned') {
                    userFilter.countryId = null;
                } else {
                    const country = COUNTRIES.find(
                        (item) =>
                            item.name.toLowerCase() === countryName.trim().toLowerCase() ||
                            item.code.toLowerCase() === countryName.trim().toLowerCase()
                    );
                    if (country) {
                        countryCodes.push(country.code, country.name);
                    } else {
                        countryCodes.push(countryName);
                    }
                }
            });
            if (userFilter.countryId !== null && countryCodes.length > 0) {
                userFilter.countryId = { [Op.in]: countryCodes };
            }
        }

        const farmFilter: WhereOptions = {
            isDeleted: 0
        };
        if (filter.farmCountry) {
            const countryCodes = [];
            filter.farmCountry.forEach((countryName) => {
                if (countryName === 'All Country' || countryName === 'Unassigned') {
                    userFilter.countryId = null;
                } else {
                    const country = COUNTRIES.find(
                        (item) =>
                            item.name.toLowerCase() === countryName.trim().toLowerCase() ||
                            item.code.toLowerCase() === countryName.trim().toLowerCase()
                    );
                    if (country) {
                        countryCodes.push(country.code, country.name);
                    } else {
                        countryCodes.push(countryName);
                    }
                }
            });
            if (userFilter.countryId !== null && countryCodes.length > 0) {
                userFilter.countryId = { [Op.in]: countryCodes };
            }
        }
        if (filter.searchPhrase) {
            Object.assign(farmFilter,{
                [Op.or]: [
                    {
                        farmName: {
                            [Op.like]: `%${filter.searchPhrase}%`
                        }
                    },
                    {
                        id: {
                            [Op.like]: `%${filter.searchPhrase}%`
                        }
                    }
                ]
            });
        }

        const productFilter: WhereOptions = {};
        if(filter?.productIds && filter?.productIds?.length > 0) {
            productFilter.id = {[Op.in]: filter?.productIds };
        }

        const diligenceReportProductionPlaceFilter: WhereOptions = {
            removed: false,
        };
        if (filter.removed !== undefined) {
            diligenceReportProductionPlaceFilter.removed = filter.removed;
        }

        const diligenceReportFilter: WhereOptions = {}
        if (filter.internalRefNum) {
            diligenceReportFilter.internalReferenceNumber = {
                [Op.like]: `%${filter.internalRefNum}%`,
            };
        }
        if(filter.diligenceReportIds !== undefined && filter.diligenceReportIds.length > 0) {
            diligenceReportFilter.id = { [Op.in]: filter.diligenceReportIds };
            diligenceReportProductionPlaceFilter.diligenceReportId = { [Op.in]: filter.diligenceReportIds };
        } else {
            if (filter.diligenceReportId !== undefined) {
                diligenceReportFilter.id = filter.diligenceReportId;
                diligenceReportProductionPlaceFilter.diligenceReportId = filter.diligenceReportId;
            }
        }
        if(filter.supplierId) {
            diligenceReportFilter.supplierId = filter.supplierId;
        }
        if(orgId){
            diligenceReportFilter.organizationId = orgId;
        }

        const productionPlaceDeforestationInfoFilter: WhereOptions = {};
     

        const productionPlaceFilter: WhereOptions = {};

           if (filter.eudrDeforestationStatus) {
            productionPlaceDeforestationInfoFilter.deforestationStatus = filter.eudrDeforestationStatus;
            productionPlaceFilter.eudr_deforestation_status = filter.eudrDeforestationStatus;
        }
        if(filter?.isEdit){
            diligenceReportProductionPlaceFilter.isEdit = filter.isEdit
        }
        if(filter?.isVerified){
            diligenceReportProductionPlaceFilter.isVerified = filter.isVerified
        }

        if (filter?.filterByDateOfRegister?.length === 2) {
            productionPlaceFilter.createdAt = {
                [Op.between]: [
                    moment(filter.filterByDateOfRegister[0]).startOf('day').toDate(),
                    moment(filter.filterByDateOfRegister[1]).endOf('day').toDate(),
                ]
            };
        }

        if (filter?.filterByDateOfLastReport?.length === 2) {
            productionPlaceFilter.updatedAt = {
                [Op.between]: [
                    moment(filter.filterByDateOfLastReport[0]).startOf('day').toDate(),
                    moment(filter.filterByDateOfLastReport[1]).endOf('day').toDate(),
                ]
            };
        }

        
        const { rows, count } = await this.productionPlaceModel.findAndCountAll({
            where: productionPlaceFilter,
            include: [
                {
                    model: Farm,
                    as: 'farm',
                    where: farmFilter,
                    required: true,
                    include: [
                        {
                            model: Geofence,
                            separate: true,
                            as: "GeoFences",
                            required: false,
                            order: [
                                ['id', 'ASC'],
                                [{ model: GeofenceCoordinates, as: "geofenceCoordinates" }, 'id', 'ASC'],
                            ],
                            where: {
                                isPrimary: true,
                            },
                            include: [
                                {
                                    model: GeofenceCoordinates,
                                    as: "geofenceCoordinates",
                                    required: false
                                },
                            ]
                        },
                        {
                            separate: true,
                            model: FarmCoordinates,
                            as: "FarmCoordinates",
                            required: false,
                            order: [['id', 'ASC']],
                        },
                        {
                            model: User,
                            as: "userDdsAssoc",
                            required: true,
                            where: userFilter,
                        },
                        {
                            model: DeforestationReportRequest,
                            as: 'lastDeforestationReport',
                            required: false,
                        }
                    ]
                },
                {
                    separate: true,
                    model: DiligenceReportProductionPlace,
                    where: diligenceReportProductionPlaceFilter,
                    required: !_.isEmpty(productionPlaceDeforestationInfoFilter),
                    include: [
                        {
                            model: ProductionPlaceDeforestationInfo,
                            required: !_.isEmpty(productionPlaceDeforestationInfoFilter),
                            where: productionPlaceDeforestationInfoFilter,
                            include: [
                                {
                                    model: DeforestationReportRequest,
                                    required: false,
                                }
                            ]
                        },
                        {
                            model: RiskMitigationFiles,
                            required: false,
                        },
                        {
                            model: AssessmentProductionPlace,
                            required: false,
                            attributes: [
                                'id', 'riskAssessmentStatus','assessmentId', 'taggableId', 'taggableType'
                            ],
                            where: {
                                ...(filter.assessmentId && { assessmentId: filter.assessmentId }),
                                ...(filter.riskAssessmentStatus && { riskAssessmentStatus: filter.riskAssessmentStatus }),
                            },
                        },
                    ],
                },
                {
                    model: DiligenceReport,
                    required: true,
                    attributes: [
                        'id', 'internalReferenceNumber', 'supplierId', 'product',
                    ],
                    through: {
                        where: diligenceReportProductionPlaceFilter,
                    },
                    include: [
                        {
                            model: User,
                            required: false,
                            attributes: [
                                'id', 'firstName', 'lastName'
                            ],
                            as: 'supplier'
                        },
                        {
                            model: ManageProduct,
                            as: 'product_detail',
                            where: productFilter,
                            required: !_.isEmpty(productFilter),
                        },
                        {
                          model: DiligenceReportAssessment,
                          as: "diligenceReportAssessment",
                          required: false,
                          include: [
                            {
                                model: Assesment,
                                as: "assessment",
                                required: false,
                            },
                          ],
                        }
                    ],
                    where: diligenceReportFilter,
                },
                {
                    model: RiskMitigationFiles,
                    required: false,
                    attributes:[
                        'id', 'file_path'
                    ],
                    as: 'risk_mitigation_files',
                },
                {
                    model: AssessmentProductionPlace,
                    required: filter.riskAssessmentStatus ? true : false,
                    attributes: [
                        'id', 'riskAssessmentStatus','assessmentId',
                    ],
                    as: 'assessment_production_place',
                    where: {
                    ...(filter.assessmentId && { assessmentId: filter.assessmentId }),
                    ...(filter.riskAssessmentStatus && { riskAssessmentStatus: filter.riskAssessmentStatus }),
                    },
                },
                {
                    model: AssessmentProductionPlace,
                    required: false,
                    attributes: [
                        'id', 'riskAssessmentStatus',
                    ],
                    as: 'all_risk_assessments',
                },
                {
                    model: DueDiligenceProductionPlacesPyData,
                    required: false,
                    attributes: [
                        'id', 'indigenousArea', 'protectedArea'
                    ],
                    as: 'dueDiligenceProductionPlacesPyData',
                    include: [
                        {
                            model: DueDiligenceProductionManuallyMitigated,
                            required: false,
                            attributes: [
                                'id', 'riskMitigationFile', 'riskMitigationComment'
                            ],
                            as: 'dueDiligenceProductionManuallyMitigated',
                        },
                    ]
                },
                {
                    model: ProductionPlaceDeforestationInfo,
                    required: !(filter.diligenceReportId || filter.diligenceReportIds?.length) && !_.isEmpty(productionPlaceDeforestationInfoFilter),
                    where: productionPlaceDeforestationInfoFilter,
                },
            ],
            offset: query.offset,
            limit: query.limit,
            distinct: true,
            col: "id",
            order: [
                ['id', 'DESC'],
                [{ model: Farm, as: 'farm' }, { model: DeforestationReportRequest, as: 'lastDeforestationReport' }, 'id', 'DESC'],
            ]
        });

        const response = {
            totalCount: count,
            count: rows.length ?? 0,
            rows: await Promise.all(
                rows.map(async (row) => {
                    let farmType = "Polygon";
                    const farm = row.farm;
                    if (farm && farm.GeoFences) {
                        for (const geofence of farm.GeoFences) {
                            if (geofence.isPrimary === 1 && geofence.geofenceRadius !== null) {
                                farmType = "Point";
                                break;
                            }
                        }
                    }
    
                    let translatedData = null;
                    if(context && row?.dueDiligenceProductionPlacesPyData) {
                        translatedData = await this.translationService.translateObject(row?.dueDiligenceProductionPlacesPyData, context, ['productionPlaceId','id','farmId']);
                        return { 
                            ...row.toJSON(),
                            farmType,
                            dueDiligenceProductionPlacesPyData: {
                                id:row?.dueDiligenceProductionPlacesPyData?.id,
                                indigenousArea: row?.dueDiligenceProductionPlacesPyData?.indigenousArea,
                                protectedArea: row?.dueDiligenceProductionPlacesPyData?.protectedArea,
                                indigenousAreaTrans: translatedData?.indigenousArea,  
                                protectedAreaTrans: translatedData?.protectedArea,  
                                dueDiligenceProductionManuallyMitigated: row?.dueDiligenceProductionPlacesPyData?.dueDiligenceProductionManuallyMitigated
                            }
                        };
                    }

                    
                    return { 
                        ...row.toJSON(),
                        farmType,
                    };
                })
            )
        };
    
        return response;
    }

    async findByCfFarmId(cfFarmId: number, lang = 'en') {
        try {
            const productionPlace = await this.productionPlaceModel.findOne({
                where: {},
                include: [
                    {
                        model: Farm,
                        as: 'farm',
                        where: {
                            cf_farmid: cfFarmId,
                        },
                        include: [
                            {
                                model: Geofence,
                                as: "GeoFences",
                                required: false,
                                include: [
                                    {
                                        model: GeofenceCoordinates,
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
                            {
                                model: User,
                                as: "userDdsAssoc",
                                required: false
                            },
                        ]
                    },
                    {
                        model: DiligenceReportProductionPlace,
                        required: false,
                        include: [
                            {
                                model: ProductionPlaceDeforestationInfo,
                                required: false,
                                include: [
                                    {
                                        model: DeforestationReportRequest,
                                        required: false,
                                    }
                                ]
                            },
                            {
                                model: RiskMitigationFiles,
                                required: false,
                            },
                            {
                                model: AssessmentProductionPlace,
                                required: false,
                                attributes: [
                                    'id', 'riskAssessmentStatus','assessmentId', 'taggableId', 'taggableType'
                                ],
                            },
                        ],
                    },
                    {
                        model: DiligenceReport,
                        required: false,
                        attributes: [
                            'id', 'internalReferenceNumber', 'supplierId', 'product',
                        ],
                        include: [
                            {
                                model: User,
                                required: false,
                                attributes: [
                                    'id', 'firstName', 'lastName'
                                ],
                                as: 'supplier'
                            },
                            {
                                model: ManageProduct,
                                as: 'product_detail',
                                required: false,
                            },
                            {
                                model: DiligenceReportAssessment,
                                as: "diligenceReportAssessment",
                                required: false,
                                include: [
                                    {
                                        model: Assesment,
                                        as: "assessment",
                                        required: false,
                                    },
                                ],
                            }
                        ],
                    },
                    {
                        model: RiskMitigationFiles,
                        required: false,
                        attributes: [
                            'id', 'file_path'
                        ],
                        as: 'risk_mitigation_files',
                    },
                    {
                        model: AssessmentProductionPlace,
                        required: false,
                        attributes: [
                            'id', 'riskAssessmentStatus',
                        ],
                        as: 'all_risk_assessments',
                    },
                    {
                        model: DueDiligenceProductionPlacesPyData,
                        required: false,
                        attributes: [
                            'id', 'indigenousArea', 'protectedArea'
                        ],
                        as: 'dueDiligenceProductionPlacesPyData',
                        include: [
                            {
                                model: DueDiligenceProductionManuallyMitigated,
                                required: false,
                                attributes: [
                                    'id', 'riskMitigationFile', 'riskMitigationComment'
                                ],
                                as: 'dueDiligenceProductionManuallyMitigated',
                            },
                        ]
                    },
                    {
                        model: ProductionPlaceDeforestationInfo,
                        required: false,
                    },
                ],
                order: [['id', 'DESC']],
                limit: 1,
            });

            if (!productionPlace) {
                return null;
            }

            let farmType = "Polygon";
            if (productionPlace.farm && productionPlace.farm.GeoFences) {
                for (const geofence of productionPlace.farm.GeoFences) {
                    if (geofence.isPrimary === 1 && geofence.geofenceRadius !== null) {
                        farmType = "Point";
                        break;
                    }
                }
            }

            // Handle translation if needed
            let translatedData = null;
            if (lang && lang !== 'en' && productionPlace?.dueDiligenceProductionPlacesPyData) {
                translatedData = await this.translationService.translateObject(
                    productionPlace?.dueDiligenceProductionPlacesPyData, 
                    { req: { lang } }, 
                    ['productionPlaceId','id','farmId']
                );
            }

            const productionPlacePlain = productionPlace.toJSON();
            const response: DueDiligenceProductionPlaceExtended = {
                ...productionPlacePlain,
                farmType: farmType,
                ...(translatedData && {
                    dueDiligenceProductionPlacesPyData: {
                        id: productionPlace?.dueDiligenceProductionPlacesPyData?.id,
                        indigenousArea: productionPlace?.dueDiligenceProductionPlacesPyData?.indigenousArea,
                        protectedArea: productionPlace?.dueDiligenceProductionPlacesPyData?.protectedArea,
                        indigenousAreaTrans: translatedData?.indigenousArea,  
                        protectedAreaTrans: translatedData?.protectedArea,  
                        dueDiligenceProductionManuallyMitigated: productionPlace?.dueDiligenceProductionPlacesPyData?.dueDiligenceProductionManuallyMitigated
                    }
                })
            };

            return response;
        } catch (err) {
            console.error('Error getting production place data by CF farm ID.', err);
            throw new HttpException(err.message || 'Error getting production place data by CF farm ID', err.status || 500);
        }
    }

    async findOne(id : number) {
        const include = [{
                model: Farm,
                where: {},
                required: true,
                include: [
                    {
                        model: Geofence,
                        as: "GeoFences",
                        required: false,
                        include: [
                            {
                                model: GeofenceCoordinates,
                                as: "geofenceCoordinates",
                                required: false
                            },
                        ]
                    }, {
                        model: FarmCoordinates,
                        as: "FarmCoordinates",
                        required: false
                    }, {
                        model: User,
                        as: "userDdsAssoc",
                        required: false
                    },
                ]
            },];
        let productionPlace = await this.productionPlaceModel.findOne({where: {
                id
            }, include});
        let farmType = "Polygon";

        if (productionPlace.farm && productionPlace.farm.GeoFences) {
            for (const geofence of productionPlace.farm.GeoFences) {
                if (geofence.isPrimary === 1 && geofence.geofenceRadius !== null) {
                    farmType = "Point";
                    break;
                }
            }
        }
        const productionPlacePlain = productionPlace.toJSON();
        const response: DueDiligenceProductionPlaceExtended = {
            ... productionPlacePlain,
            farmType: farmType
        };
        return response;
    }

    async riskMitigation(input : UpdateRiskMitigationInput): Promise < string > {
        const {
            id,
            files,
            ...updateData
        } = input;
        const transaction = await this.sequelize.transaction();
        try {
            const productionPlace = await this.diligenceReportProductionPlaceModel.findByPk(id);
            if(!productionPlace) return 'No Production Place found.';
            const currentDate = moment(new Date().toISOString()).format('YYYY-MM-DD')
            let deforestationInfoId = productionPlace.productionPlaceDeforestationInfoId;
            if(!productionPlace.productionPlaceDeforestationInfoId) {
                const deforestationInfo = await this.placeDeforestationInfo.create({
                    lastDeforestationMitigationDate: currentDate,
                    deforestationMitigationComment: updateData.risk_mitigation_comment,
                    deforestationStatus: updateData.eudr_deforestation_status,
                }, { transaction });
                deforestationInfoId = deforestationInfo.id;
                productionPlace.productionPlaceDeforestationInfoId = deforestationInfo.id;
                await productionPlace.save({ transaction });
            } else {
                await this.placeDeforestationInfo.update({
                    lastDeforestationMitigationDate: currentDate,
                    deforestationMitigationComment: updateData.risk_mitigation_comment,
                    deforestationStatus: updateData.eudr_deforestation_status,
                }, { where: { id: deforestationInfoId }, transaction });
            }
            const productionPlaces = await this.diligenceReportProductionPlaceModel.findAll({
                where: {
                    productionPlaceDeforestationInfoId: productionPlace.productionPlaceDeforestationInfoId,
                },
                transaction,
            });

            await this.productionPlaceModel.update({
                ...updateData,
                lastMitigatedDate: currentDate,
            }, { where: { productionPlaceDeforestationInfoId: deforestationInfoId }, transaction });

            if (files && files.length > 0) {
                const productionPlaceIds = new Set();
                productionPlaces.forEach(place => productionPlaceIds.add(place.dueDiligenceProductionPlaceId));
                const fileRecords = [];
                files.forEach(file => {
                    Array.from(productionPlaceIds).forEach(id => {
                        fileRecords.push({ file_path: file, production_place_id: id });
                    });
                });
                const riskMitigationFiles = await this.riskMitigationFileModel.bulkCreate(fileRecords, { transaction });
                const reportPlaceFileRecords = [];
                productionPlaces.forEach(place => {
                    const file = riskMitigationFiles.find(file => place.dueDiligenceProductionPlaceId == file.production_place_id);
                    reportPlaceFileRecords.push({
                        riskMitigationFileId: file.id,
                        diligenceReportProductionPlaceId: place.id,
                    });
                });
                await this.reportPlaceMitigationFileModel.bulkCreate(reportPlaceFileRecords, { transaction });
            }
            await transaction.commit();

            return "Risk mitigated manually.";
        } catch (error) {
            await transaction.rollback();
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async manuallyMitigated(input : UpdateManuallyMitigationInput[]): Promise < string > {
        try {
            if(input.length === 0) { throw new Error('Input is empty.') }

            if(input.length > 10) { throw new Error('File can be uploaded max to 10.') }

            await Promise.all(
                input.map(async (data) => {
                    const productionPyData = await this.dueDiligenceProductionPyData.findOne({where: {id: data?.id}})
                    let updateData = {}
                    if(productionPyData?.indigenousArea !== 'No invasion of protected areas') {
                        updateData = {indigenousArea: 'Manually Mitigated'}
                    }
                    if(productionPyData?.protectedArea !== 'No invasion of protected areas') {
                        updateData = {...updateData, protectedArea: 'Manually Mitigated'}
                    }

                    if(Object.values(updateData).length > 0) {
                        await productionPyData.update(updateData);
                    }

                    const manuallyMitigated = await this.dueDiligenceProductionManuallyMitigated.findOne({
                        where: {
                            dueDiligenceProductionPlacesPyDataId : data?.id,
                            riskMitigationFile: data?.riskMitigationFile,
                        }
                    });

                    if(manuallyMitigated) {
                        manuallyMitigated.update({ riskMitigationComment: data?.riskMitigationComment});
                        return manuallyMitigated;
                    }

                    return await this.dueDiligenceProductionManuallyMitigated.create({
                        dueDiligenceProductionPlacesPyDataId : data?.id,
                        riskMitigationFile: data?.riskMitigationFile,
                        riskMitigationComment: data?.riskMitigationComment
                    });
                })
            );
            
            return "Risk mitigated manually.";
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async removeManuallyMitigatedFile(fileId: number): Promise<string> {
        try {
            await this.dueDiligenceProductionManuallyMitigated.destroy({where: { id : fileId }});
            
            return "File removed successfully.";
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async removeRiskMitigationFile(productionPlaceId: number, fileId: number): Promise<string> {
        const transaction = await this.sequelize.transaction();
        try {
            const productionPlace = await this.productionPlaceModel.findByPk(productionPlaceId);
            if (!productionPlace) {
            throw new Error("Production place not found.");
            }

            const deletedCount = await this.riskMitigationFileModel.destroy({
                where: {
                    production_place_id: productionPlaceId,
                    id: fileId,
                },
                transaction,
            });

            if (deletedCount === 0) {
                throw new Error("File not found or already deleted.");
            }

            await transaction.commit();
            return "File removed successfully.";
        } catch (error) {
            await transaction.rollback();
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async removeUnacceptedFarms(args: { diligence_report_id: number, assessment_id: number }): Promise<{ success: boolean, message: string }> {
        const { diligence_report_id, assessment_id } = args;
    
        // Fetch the relevant production places
        const productionPlaces = await this.productionPlaceModel.findAll({
          where: {
            dueDiligenceReportId: diligence_report_id,
            removed: false,
          },
          include: [
            {
              model: AssessmentProductionPlace,
              as: 'all_risk_assessments',
              where: {
                assessmentId: assessment_id
              },
              required: true

            },
          ],
        });
    
        // Filter the production places to remove
        const productionPlacesToRemove = productionPlaces.filter((productionPlace) => {
            const allRiskAssessments = productionPlace.all_risk_assessments || [];
            return allRiskAssessments.length > 0 && allRiskAssessments.every(
              (assessment) =>
                assessment.riskAssessmentStatus !== null &&
                assessment.riskAssessmentStatus !== RiskAssessmentStatus.APPROVED
            );
          });

        // Update the filtered production places
        const updatedCount = await Promise.all(
          productionPlacesToRemove.map((productionPlace) =>
            this.productionPlaceModel.update(
              { removed: true },
              { where: { id: productionPlace.id } }
            )
          )
        );
    
        if (updatedCount.length > 0) {
          return { success: true, message: `Farm removed successfully` };
        } else {
          return { success: false, message: "No farms found to remove" };
        }
      }

    async removeFarms(args : RemoveFarmArgs): Promise < {
        success: boolean,
        message: string
    } > {
        const {
            production_place_id,
            diligence_report_id,
            farm_id,
            eudr_deforestation_status,
            risk_assessment_status
        } = args;
        const whereClause: any = {};
        
        let updatedCount = 0;
        if(diligence_report_id) {
            if (production_place_id) {
                whereClause.dueDiligenceProductionPlaceId = production_place_id;
            }
            if (farm_id) {
                whereClause.farmId = farm_id;
            }
            whereClause.diligenceReportId = diligence_report_id;
            if(eudr_deforestation_status || risk_assessment_status) {
                const infoWhere : any = {};
                if(eudr_deforestation_status) {
                    infoWhere.originalDeforestationStatus = eudr_deforestation_status;
                }
                if(risk_assessment_status) {
                    infoWhere.riskAssessmentStatus = risk_assessment_status;
                }
                const items = await this.diligenceReportProductionPlaceModel.findAll({
                    attributes: ['id'],
                    include: [
                        {
                            model: ProductionPlaceDeforestationInfo,
                            where: infoWhere,
                            required: true, 
                        }
                    ]
                });
                const ids = items.map(item => item.id);
                whereClause.id = { [Op.in]: ids };
            }
            [updatedCount] = await this.diligenceReportProductionPlaceModel.update({
                removed: true,
            }, {
                where: whereClause,
            });
        } else {
            const reportPlaceWhere: any = {};
            if (production_place_id) {
                whereClause.id = production_place_id;
                reportPlaceWhere.dueDiligenceProductionPlaceId = production_place_id;
            }
            if (farm_id) {
                whereClause.farmId = farm_id;
                reportPlaceWhere.farmId = farm_id;
            }
            [updatedCount] = await this.productionPlaceModel.update(
                {
                    removed: true
                },
                {
                    where: whereClause,
                }
            );
            const [reportPlaceUpdateCount] = await this.diligenceReportProductionPlaceModel.update({
                removed: true,
            }, {
                where: reportPlaceWhere
            });
            updatedCount += reportPlaceUpdateCount;
        }


        if (updatedCount > 0) {
            return {success: true, message: `Farm removed successfully`};
        } else {
            return {success: false, message: "No farms found to remove"};
        }
    }

    async restoreFarms(args : RestoreFarmsArgs): Promise < string > {
        const {
            diligence_report_id,
            farm_id
        } = args;
        const whereClause: any = {
            diligenceReportId: diligence_report_id,
            removed: true
        };
        if (farm_id !== undefined) {
            whereClause.dueDiligenceProductionPlaceId = farm_id;
        }

        const [updatedCount] = await this.diligenceReportProductionPlaceModel.update(
            {
                removed: false
            },
            {where: whereClause}
        );
        return `${updatedCount} farms restored.`;
    }

    async highRiskFarmRisksMitigation(input : HighRiskFarmMitigationInput, orgId: number): Promise < {
        success: boolean,
        message: string
    } > {
        const {
            due_diligence_report_id,
            file,
            ...updateData
        } = input;
        let whereClause: any = {
            dueDiligenceReportId: due_diligence_report_id
        };
        const highStatuses = [EudrDeforestationStatus.VERY_HIGH_DEFORESTATION_PROBABILITY, EudrDeforestationStatus.HIGH_DEFORESTATION_PROBABILITY];

        const currentDate = moment(new Date().toISOString()).format('YYYY-MM-DD')
        const transaction = await this.sequelize.transaction();

        try {
            const reportProductionPlaces = await this.diligenceReportProductionPlaceModel.findAll({
                where: {
                    diligenceReportId: due_diligence_report_id,
                },
                attributes: ["id", "dueDiligenceProductionPlaceId", "productionPlaceDeforestationInfoId"],
                include: [
                    {
                        model: ProductionPlaceDeforestationInfo,
                        required: true,
                        attributes: [],
                        where: {
                            [Op.or]: [
                                { deforestationStatus: { [Op.in]: highStatuses } },
                                { originalDeforestationStatus: { [Op.in]: highStatuses } }
                            ]
                        }
                    }
                ],
            });
            const infoIds = reportProductionPlaces.map(place => place.productionPlaceDeforestationInfoId);
            await this.placeDeforestationInfo.update({
                deforestationStatus: updateData.eudr_deforestation_status,
                deforestationMitigationComment: updateData.risk_mitigation_comment,
                lastMitigationDate: currentDate,
            },
            {
                where: { id: { [Op.in]: infoIds } },
                transaction,
            });
            await this.productionPlaceModel.update({...updateData, lastMitigatedDate: currentDate}, {
                where: {
                    dueDiligenceReportId: due_diligence_report_id,
                    eudr_deforestation_status: { [Op.in]: highStatuses },
                },
                transaction
            });

            const fileRecords = reportProductionPlaces.map((place) => ({file_path: file, production_place_id: place.dueDiligenceProductionPlaceId}));
            const mitigationFiles = await this.riskMitigationFileModel.bulkCreate(fileRecords, {transaction});
            const reportPlaceFiles = reportProductionPlaces.map(place => {
                const file = mitigationFiles.find(item => item.production_place_id == place.dueDiligenceProductionPlaceId);
                return {
                    riskMitigationFileId: file.id,
                    diligenceReportProductionPlaceId: place.id,
                }
            });
            await this.reportPlaceMitigationFileModel.bulkCreate(reportPlaceFiles, {transaction});
            await transaction.commit();

            
        if (reportProductionPlaces.length > 0) {
            return {success: true, message: `Risk mitigated manually for ${reportProductionPlaces.length} high risk farms`};
        } else {
            return {success: false, message: "No farms with High Risk is currently available to remove"};
        }

        } catch (error) {
            await transaction.rollback();
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async createProductionPlaceDispute(input : ProductionPlaceDisputeInput, orgId: number, userId: number): Promise < ProductionPlaceDisputes > {
        const productionPlaceDeforestationInfo = await this.placeDeforestationInfo.findOne({
            where: {
                deforestationReportRequestId: input.reportRequestId,
            },
            include: [
                {
                    model: DeforestationReportRequest,
                    required: true,
                }
            ]
        });
        const reportProductionPlace = await this.diligenceReportProductionPlaceModel.findOne({
            where: {
                productionPlaceDeforestationInfoId: productionPlaceDeforestationInfo.id,
            }
        });
        if(!productionPlaceDeforestationInfo || !reportProductionPlace) throw Error('Production place not found.');
        if(productionPlaceDeforestationInfo.lastDisputeResolvedDate && orgId){
            const eudrSetting = await this.EudrSettingModel.findOne({
                where: {
                  org_id: orgId,
                },
                attributes: ["dynamicExpiryTime", "dynamicExpiryTimePeriod"],
            });
            const deforestationExpiryTime = eudrSetting?.dynamicExpiryTime || 0;
            const deforestationExpiryPeriod = (eudrSetting?.dynamicExpiryTimePeriod || 'days') as moment.DurationInputArg2 ;
            const expiryDateBefore = moment().subtract(deforestationExpiryTime, deforestationExpiryPeriod).format('YYYY-MM-DD');
            if (moment(productionPlaceDeforestationInfo.lastDisputeResolvedDate).isAfter(expiryDateBefore)) {
                throw Error("Dispute is not expired yet.")
            }
        }

        const geofence = await this.geofenceModel.create({
            farmId: productionPlaceDeforestationInfo.deforestationReport.farmId,
            geofenceName: `dispute-area-${input.reportRequestId}-${Date.now()}`,
            ...input.geofence
        });
        if (!geofence) throw Error("Failed to create geofence");
        // Createing geofence coordinates
        if (input.coordinates.length > 0) {
            const coordinates = input.coordinates.map((coordinate) => {
                return {
                    ...coordinate,
                    geofenceId: geofence.id
                }
            });
            await this.geofenceCoordinateModel.bulkCreate(coordinates);
        }
        // Saving dispute
        const dispute = {
            productionPlaceId: reportProductionPlace.dueDiligenceProductionPlaceId,
            createdBy: userId,
            title: input.title,
            description: input.description,
            s3Key: input.s3Key,
            s3Location: input.s3Location,
            geofenceId: geofence.id,
            status: input.status,
            initialPlantationDate: input.initialPlantationDate,
            deforestationReportRequestId: productionPlaceDeforestationInfo.deforestationReportRequestId,
        };

        const disputeRecord = await this.disputeModal.create(dispute);

        const fullDisputeData = await this.findOneDispute(disputeRecord.id);
        this.sendDisputeAlert(disputeRecord.id, fullDisputeData)
        this.sendDisputeEmail(reportProductionPlace.dueDiligenceProductionPlaceId, fullDisputeData);
        return fullDisputeData;
    }

    async sendDisputeEmail(disputeId: number, disputeData: ProductionPlaceDisputes) {
        try {
        const farmType = String(disputeData.production_place?.farm?.farmType || 'Polygon');
        const emailParams = {
            toEmail: `${CONSTANT.DISPUTE_REPORT_PRODUCTION_PLACE_TO_EMAIL}`,
            subject: `Dispute Report for Production Place`,
            contentParams: {
            fullName: `${disputeData.creating_user.firstName} ${disputeData.creating_user.lastName}` || 'Unknown',
            organizationName: 'Dimitra',
            },
        };
    
        const pdfBuffer = await this.fetchPdfBuffer(disputeId);
    
        const geoJsonBuffer = this.generateGeoJsonBuffer(farmType, disputeData.geofence.geofenceCoordinates);
    
        await this.mailService.sendEmailWithAttachment('DisputeNotification', emailParams, [
            {
            filename: `dispute-report-${disputeId}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
            },
            {
            filename: `farm-boundary.geojson`,
            content: geoJsonBuffer,
            contentType: 'application/json',
            },
        ]);
    
        Logger.log(`Dispute email sent successfully for dispute ID: ${disputeId}`);
        } catch (error) {
        Logger.error('Error sending dispute email:', error);
        throw new Error(`Failed to send dispute email: ${error.message}`);
        }
    }
   
    async fetchPdfBuffer(productionPlaceId: number): Promise<Buffer> {
        Logger.log('Starting process to generate dispute PDF.');
        try {
        const reportFolderName = `Dispute-${Date.now()}`;
        const reportDir = path.resolve(__dirname, `reports/${reportFolderName}`);
        await fs.promises.mkdir(reportDir, { recursive: true });

        Logger.log(`Fetching details for production place ID: ${productionPlaceId}`);
        const productionPlaceDetail = await this.productionPlaceDetail(productionPlaceId); // Replace with actual implementation.

        Logger.log(`Fetching disputes for production place ID: ${productionPlaceId}`);
        const productionPlaceDisputes = await this.findDisputesByProductionPlaceId(productionPlaceId); // Replace with actual implementation.

        if (!productionPlaceDetail || !productionPlaceDisputes.length) {
            throw new Error(`No data found for production place ID: ${productionPlaceId}`);
        }

        Logger.log('Rendering EJS template for dispute report.');
        const template = fs.readFileSync(
            path.resolve(__dirname, '../../deforestation/view', 'dispute-report.ejs'),
            'utf8',
        );
        const html = await ejs.render(template, {
            report: {
            disputeId: productionPlaceDisputes[0].id,
            assessmentId: '',
            disputeStatus: productionPlaceDisputes[0].status,
            dimitraFarmId: productionPlaceDetail.farm.cf_farmid,
            farmName: productionPlaceDetail.farm.farmName,
            farmAddress: productionPlaceDetail.farm.address,
            latitude: productionPlaceDetail.farm.lat,
            longitude: productionPlaceDetail.farm.log,
            farmArea: productionPlaceDetail.farm.area,
            },
            disputes: productionPlaceDisputes,
        });

        Logger.log('Generating PDF from HTML content.');
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'a4',
            printBackground: true,
            margin: { top: '20mm', bottom: '30mm', left: '20mm', right: '20mm' },
        });

        await browser.close();
        Logger.log('PDF generated successfully.');

        return pdfBuffer;
        } catch (error) {
        Logger.error('Error generating PDF:', error.message);
        throw error;
        }
    }

    private generateGeoJsonBuffer(farmType: string, coordinates: { lat: string; log: string }[]): Buffer {
    let geoJson;
    
        const formattedCoordinates = coordinates.map(coord => [parseFloat(coord.log), parseFloat(coord.lat)]);
        formattedCoordinates.push([parseFloat(coordinates[0].log), parseFloat(coordinates[0].lat)]);  // Close the polygon
    
        geoJson = {
        type: 'FeatureCollection',
        features: [
            {
            type: 'Feature',
            geometry: {
                type: farmType,
                coordinates: [formattedCoordinates],
            },
            properties: {},
            },
        ],
        };
    
    return Buffer.from(JSON.stringify(geoJson, null, 2));  // Pretty-print JSON
    }
    
    async productionPlaceDetail (productionPlaceId: number){
        const include = [{
            model: Farm,
            where: {},
            attributes: ['id', 'cf_farmid', 'farmName', 'lat', 'log', 'address', 'area', 'farmType'],
            required: true,
            include: [
                {
                    attributes: ['id', 'isPrimary', 'geofenceName', 'geofenceArea', 'geofenceRadius', 'geofenceCenterLog', 'geofenceCenterLat'],
                    model: Geofence,
                    as: "GeoFences",
                    required: false,
                    include: [
                        {
                            attributes: ['id', 'lat', 'log'],
                            model: GeofenceCoordinates,
                            as: "geofenceCoordinates",
                            required: false
                        },
                    ]
                }, {
                    attributes: ['id', 'lat', 'log'],
                    model: FarmCoordinates,
                    as: "FarmCoordinates",
                    required: false
                }, {
                    attributes: ['id', 'cf_userid', 'firstName', 'lastName', 'countryCode', 'mobile', 'email'],
                    model: User,
                    as: "userDdsAssoc",
                    required: false
                },
            ]
        },];
        let productionPlace = await this.productionPlaceModel.findOne({where: {
                id: productionPlaceId
            }, include});
        let farmType = "Polygon";

        if (productionPlace.farm && productionPlace.farm.GeoFences) {
            for (const geofence of productionPlace.farm.GeoFences) {
                if (geofence.isPrimary === 1 && geofence.geofenceRadius !== null) {
                    farmType = "Point";
                    break;
                }
            }
        }
        const productionPlacePlain = productionPlace.toJSON();
        const response: DueDiligenceProductionPlaceExtended = {
            ... productionPlacePlain,
            farmType: farmType
        };
        return response;
    }

    async findDisputesByProductionPlaceId( productionPlaceId: number){
        const include = [
            {
                attributes: [
                    'id',
                    'comment',
                    's3Key',
                    's3Location',
                    'createdAt'
                ],
                model: ProductionPlaceDisputeComments,
                as: 'comments',
                include: [
                    {
                        attributes: ['id', 'cf_userid', 'firstName', 'lastName', 'countryCode', 'mobile', 'email'],
                        model: User,
                    }
                ]
            }, {
                attributes: ['id', 'cf_userid', 'firstName', 'lastName', 'countryCode', 'mobile', 'email'],
                model: User,
                required: true
            },
            {
                model: Geofence,
                include: [
                    {
                        model: GeofenceCoordinates
                    }
                ]
            }
        ];
            return await this.disputeModal.findAll(
                {
                    where:{
                        productionPlaceId 
                    },
                    attributes:['id',
                        'productionPlaceId',
                        'title',
                        'description',
                        's3Key',
                        's3Location',
                        'status',
                        'createdAt'
                    ],
                    include,
                    order: [
                        [
                            'createdAt', 'ASC'
                        ],
                        [
                            {
                                model: ProductionPlaceDisputeComments,
                                as: 'comments'
                            },
                            'createdAt',
                            'ASC'
                        ],
                    ],
                }
            );
    }

    async updateProductionPlaceDispute(id: number, input: UpdateProductionPlaceDisputeInput): Promise<ProductionPlaceDisputes> {
        const updatedDispute = {
            title: input.title,
            description: input.description,
            s3Key: input.s3Key,
            s3Location: input.s3Location,
            status: input.status,
            initialPlantationDate: input.initialPlantationDate,
        }

        await this.disputeModal.update(updatedDispute, {
            where: {
                id
            }
        });

        return this.findOneDispute(id);
    }

    async findOneDispute(id: number) {
        const dispute = await this.disputeModal.findOne({
            where: {
                id
            },
            include: [
                {
                    model: ProductionPlaceDisputeComments,
                    as: 'comments',
                    include: [
                        {
                            model: User
                        }
                    ]
                }, {
                    model: DueDiligenceProductionPlace,
                    include: [
                        {
                            model: Farm
                        }
                    ]
                }, {
                    model: User,
                    required: true
                },
                {
                    model: Geofence,
                    include: [
                        {
                            model: GeofenceCoordinates
                        }
                    ]
                }
            ]
        });

        return dispute;

    }

    async deleteProductionPlaceDispute(id: number): Promise < string > {
            // Delete related comments first
        await ProductionPlaceDisputeComments.destroy({
            where: { disputeId: id }
        });

        // Then delete the dispute
        await ProductionPlaceDisputes.destroy({
            where: { id: id }
        });

        return "Dispute deleted successfully";
    }
    async createProductionPlaceDisputeComment(input : DisputeCommentInput, userId: number): Promise<ProductionPlaceDisputeComments> {
        const comment = {
            disputeId: input.disputeId,
            commentedBy: userId,
            comment: input.comment,
            s3Key: input.s3Key,
            s3Location: input.s3Location
        };

        const response = await this.disputeCommentModal.create(comment);

        return await this.disputeCommentModal.findByPk(response.id, {
            include: [
                {
                    model: User,
                    as: 'commenting_user'
                }
            ]
        });
    }

    async findProductionPlaceDisputes(filter? : ProductionPlaceDisputeFilterInput, organizationId?: number, subOrganizationId = null): Promise<ProductionPlaceDisputePaginatedResponse> {
        const offset = filter.page ? (filter.page - 1) * filter.limit: 0;
        const limit = filter.limit ?? 10;

        let where = {};

        if (filter.reportRequestId) {
            where['deforestationReportRequestId'] = filter.reportRequestId;
        }
        if (filter?.disputeIds?.length) {
            where['id'] = {
                [Op.in]: filter.disputeIds  
            };
        }

        if (filter.searchPhrase) {
            where[Op.or] = {
                'title': {
                    [Op.like]: `%${filter.searchPhrase}%`
                },
                'description': {
                    [Op.like]: `%${filter.searchPhrase}%`
                }
            }
        }

        if (filter.disputeStatus) {
            where['status'] = filter.disputeStatus;
        }

        const include = [
            {
                model: ProductionPlaceDisputeComments,
                as: 'comments',
                include: [
                    {
                        model: User,
                    }
                ]
            },
            {
                model: DueDiligenceProductionPlace,
                include: [
                    {
                        model: Farm
                    }
                ]
            },
            {
                model: User,
                required: true,
                where: {
                    organization: organizationId,
                    ...(subOrganizationId && { suborganizationId: subOrganizationId }),
                }
            },
            {
                model: Geofence,
                include: [
                    {
                        model: GeofenceCoordinates
                    }
                ]
            }
        ];

        let response: {
            totalCount?: number,
            count: number,
            rows: ProductionPlaceDisputes[]
        };

        response = await this.disputeModal.findAndCountAll(
            {
                where,
                include,
                offset,
                limit,
                order: [
                    [
                        'createdAt', 'ASC'
                    ],
                    [
                        {
                            model: ProductionPlaceDisputeComments,
                            as: 'comments'
                        },
                        'createdAt',
                        'ASC'
                    ],
                ],
                distinct: true
            }
        );

        response.totalCount = response.count;
        response.count = response.rows.length;
        response.rows = response.rows;

        return response;
    }

    async findAssessmentTaggable(diligenceReportId:number, assessmentId:number){
        const upload =   await this.assessmentUploadModel.findOne({
            attributes:['id'],
            where: {
                farmId: { [Op.is]: null },
                diligence_report_id: diligenceReportId,
                assessment_id: assessmentId,
            }
        })

        const assessmentSurvey = await this.assessmentSurveyModel.findOne({
            attributes:['id'],
            where: {
                userFarmId: { [Op.is]: null },
                dueDiligenceId: diligenceReportId,
                assessmentId,
            }
        });
        return {
            uploadId:upload?.id, 
            assessmentSurveyId:assessmentSurvey?.id
        }
    }

    async updateRiskAssessmentStatus(
        riskAssessmentStatusInput: RiskAssessmentStatusInput,
        organizationId: number
    ) {
        try {
            const {
                productionPlaceId,
                diligenceReportId,
                assessmentId,
                riskAssessmentStatus,
                taggableType,
            } = riskAssessmentStatusInput;
            let taggable: AssessmentUploads | AssessmentSurvey;
            if(productionPlaceId){
                const reportProductionPlace = await this.diligenceReportProductionPlaceModel.findOne({
                    where: {
                        diligenceReportId,
                        dueDiligenceProductionPlaceId: productionPlaceId,
                    },
                    include: [
                        {
                            model: ProductionPlaceDeforestationInfo,
                            required: false,
                        }
                    ]
                });
                if(!reportProductionPlace.productionPlaceDeforestationInfo) {
                    const newInfo = await this.placeDeforestationInfo.create({
                        riskAssessmentStatus,
                    });
                    reportProductionPlace.productionPlaceDeforestationInfoId = newInfo.id;
                    await reportProductionPlace.save();
                } else {
                    reportProductionPlace.productionPlaceDeforestationInfo.riskAssessmentStatus = riskAssessmentStatus as RiskAssessmentStatus;
                    await reportProductionPlace.productionPlaceDeforestationInfo.save();
                }
                taggable = taggableType === 'uploads' ? await this.assessmentUploadModel.findOne({
                    where: {
                        farmId: reportProductionPlace.farmId,
                        assessment_id: assessmentId,
                    }
                }) : await this.assessmentSurveyModel.findOne({
                    where: {
                        userFarmId: reportProductionPlace.farmId,
                        assessmentId,
                    }
                });
                let assessmentProductionPlace = await this.assessmentProductionPlaceService.findOne({
                    where:{
                        diligenceReportId,
                        productionPlaceId,
                        assessmentId,
                        taggableType,
                        taggableId: taggable?.id,
                    }
                });

                if(!assessmentProductionPlace){
                    assessmentProductionPlace = await this.assessmentProductionPlaceService.create({
                        productionPlaceId,
                        diligenceReportId,
                        assessmentId,
                        riskAssessmentStatus,
                        taggableId: taggable?.id,
                        taggableType,
                        expiryDate: 'expiresOn' in taggable ? taggable.expiresOn : taggable.expiry_date,
                    });
                } else {
                    assessmentProductionPlace.set({
                        expiryDate: 'expiresOn' in taggable ? taggable.expiresOn : taggable.expiry_date,
                        riskAssessmentStatus,
                    });
                    await assessmentProductionPlace.save();
                }

                const existingReportPlaceAssessmentPlace = await this.ReportPlaceAssessmentProductionPlaceModel.findOne({
                    where: {
                        assessmentProductionPlaceId: assessmentProductionPlace.id,
                        diligenceReportProductionPlaceId: reportProductionPlace.id,
                    }
                });
                if(!existingReportPlaceAssessmentPlace) await this.ReportPlaceAssessmentProductionPlaceModel.create({
                    assessmentProductionPlaceId: assessmentProductionPlace.id,
                    diligenceReportProductionPlaceId: reportProductionPlace.id,
                });
            } else {
                taggable = taggableType === 'uploads' ? await this.assessmentUploadModel.findOne({
                    where: {
                        farmId: { [Op.is]: null },
                        diligence_report_id: diligenceReportId,
                        assessment_id: assessmentId,
                    }
                }) : await this.assessmentSurveyModel.findOne({
                    where: {
                        userFarmId: { [Op.is]: null },
                        dueDiligenceId: diligenceReportId,
                        assessmentId,
                    }
                });
                const reportProductionPlaces = await this.diligenceReportProductionPlaceModel.findAll({
                    where:{
                        diligenceReportId,
                    },
                    include: [
                        {
                            model: ProductionPlaceDeforestationInfo,
                            required: false,
                        }
                    ]
                });

                // Perform upsert for each production place
                await Promise.all(
                    reportProductionPlaces.map(async (place) => {
                        if(!place.productionPlaceDeforestationInfo) {
                            const newInfo = await this.placeDeforestationInfo.create({
                                riskAssessmentStatus,
                            });
                            place.productionPlaceDeforestationInfoId = newInfo.id;
                            await place.save();
                        } else {
                            place.productionPlaceDeforestationInfo.riskAssessmentStatus = riskAssessmentStatus as RiskAssessmentStatus;
                            await place.productionPlaceDeforestationInfo.save();
                        }
                        let assessmentProductionPlace = await this.assessmentProductionPlaceService.findOne({
                            where: {
                                productionPlaceId: place.dueDiligenceProductionPlaceId,
                                assessmentId,
                                diligenceReportId,
                                taggableType,
                                taggableId: taggable?.id,
                            },
                        });
                        if(assessmentProductionPlace) {
                            assessmentProductionPlace.set({
                                expiryDate: 'expiresOn' in taggable ? taggable.expiresOn : taggable.expiry_date,
                                riskAssessmentStatus,
                            });
                            await assessmentProductionPlace.save();
                        } else {
                            assessmentProductionPlace = await this.assessmentProductionPlaceService.create({
                                productionPlaceId: place.dueDiligenceProductionPlaceId,
                                diligenceReportId,
                                assessmentId,
                                riskAssessmentStatus,
                                taggableId: taggable?.id,
                                taggableType,
                                expiryDate: 'expiresOn' in taggable ? taggable.expiresOn : taggable.expiry_date,
                            });
                        }

                        const existingReportPlaceAssessmentPlace = await this.ReportPlaceAssessmentProductionPlaceModel.findOne({
                            where: {
                                assessmentProductionPlaceId: assessmentProductionPlace.id,
                                diligenceReportProductionPlaceId: place.id,
                            }
                        });
                        if(!existingReportPlaceAssessmentPlace) await this.ReportPlaceAssessmentProductionPlaceModel.create({
                            assessmentProductionPlaceId: assessmentProductionPlace.id,
                            diligenceReportProductionPlaceId: place.id,
                        });
                    })
                );
            }
            if(taggable instanceof AssessmentUploads) {
                taggable.riskAssessmentStatus = riskAssessmentStatus;
                await taggable.save();
            } else {
                if(riskAssessmentStatus === 'mitigation_required') taggable.originalRiskAssessmentStatus = taggable.riskAssessmentStatus;
                taggable.riskAssessmentStatus = riskAssessmentStatus;
                await taggable.save();
            }

            return {
                success: true,
                message: "Successfully updated risk assessment status.",
            };
        } catch (error) {
            console.error("Error updating risk assessment status:", error);
            return {
                success: false,
                message: `Failed to update risk assessment status. ${error}`,
            };
        }
    }



  async updateEUDRAssessmentStatus(
    updateEudrDeforestationStatusInput: UpdateEUDRDeforestationStatusInput
    ): Promise<{ message: string; success: boolean }> {
        const { farm_id, diligence_report_id, ...item } =
        updateEudrDeforestationStatusInput;
        const transaction = await this.sequelize.transaction();
        try {
            for(const id of farm_id){
                const productionPlaceData = await this.productionPlaceModel.findOne({
                    where: {
                    farmId: id,
                    dueDiligenceReportId: diligence_report_id,
                    removed: 0,
                    },
                    transaction,
                });

                if (!productionPlaceData) {
                    throw new NotFoundException("Production place not found.");
                }

                await productionPlaceData.update(item, { transaction });
            }

            await transaction.commit();

            return {
                message: "Successfully updated EUDR deforestation status.",
                success: true,
            };
        } catch (error) {
        await transaction.rollback();
        throw new HttpException(
            `Failed to upload files. ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR
        );
        }
    }

    async runJob(job: Job): Promise<Job> {
        try {
            this.initRun(job);
            const command = job.payload.command;
            if(typeof command !== 'string') return;
            switch(command) {
                case 'IMPORT':
                    await this.importProductionPlaceFromJob(job);
                    break;
                case 'PRODUCTION_PLACE_WARNING_RUN':
                    await this.productionPlaceWarningService.processAndStoreProductionPlaceWarning(job)
                    break
                default:
                    break;
            }
            this.markJobAsComplete(job);
            return job;
        } catch (error) {
            console.error(error);
            this.removeJob(job);
            if(job.modelId && job.modelType === 'DiligenceReport') {
                await this.diligenceReportModal.update({ status: 'Ready to Proceed', current_step: 3 }, { where: { id: job.modelId } });
                await this.sendFarmUploadNotification(job.modelId);
            }
            throw error;
        }
    }

    async sendFarmUploadNotification(diligenceReportId: string) {
        const reportDetail = await this.diligenceReportModal.findOne({
          where:{
            id: diligenceReportId
          },
          include:[
            {
                model: User,
                as:'user',
                required: true
            }
          ]
        })
        await this.messageQueueingService.publishNotification({
          title: "Farm Data Uploaded",
          message: "Farm data has been successfully uploaded. Tap here to review.",
          type: "farm_location",
          notify: "admin",
          userId: reportDetail.user.cf_userid,
          users: [reportDetail.user.cf_userid],
          data: JSON.stringify({
            reportId: diligenceReportId,
            redirectionPath:""
          })
        })
      }

      async generateGeoJson(farmIds) {
        let obj = {
          type: "FeatureCollection",
        }
        let features = []
        for (let i=0; i < farmIds.length; i++) {
          const productionPlace = await this.productionPlaceModel.findOne({
            where: {
              farmId: farmIds[i],
              removed: 0,
            },
            include: [
              {
                model: Farm,
                as: 'farm',
                where: {
                    isDeleted: 0
                },
                required: true,
                include: [
                    {
                        model: Geofence,
                        as: "GeoFences",
                        required: false,
                        include: [
                            {
                                model: GeofenceCoordinates,
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
                    {
                        model: User,
                        as: "userDdsAssoc",
                        required: true,
                    },
                ]
            }, 
            ]
          })
          const hasPrimary = productionPlace.farm.GeoFences.every(item => item.isPrimary === 1);
          if (productionPlace && productionPlace.farm.GeoFences.length && hasPrimary ) {
            let feature = {
              type: "Feature",
              properties: {
                ProductionPlace: productionPlace.farm.farmName || 'NA',
                ProducerName: productionPlace.farm.userDdsAssoc.firstName + ' ' + productionPlace.farm.userDdsAssoc.lastName,
                ProducerCountry: productionPlace.farm.userDdsAssoc.countryId,
                Address: productionPlace.farm.address,
              },
            }
            productionPlace.farm.GeoFences.forEach((gf) => {
              if (gf.isPrimary) {
                const farmCoo = productionPlace.farm.FarmCoordinates.map(({ lat, log }) => [parseFloat(log), parseFloat(lat)]);
                feature['geometry'] = gf.geofenceRadius === null
                  ? {
                      type: 'Polygon',
                      coordinates: [[...farmCoo, farmCoo[0]]]
                    }
                  : {
                      type: 'Point',
                      coordinates: [gf.geofenceCenterLat, gf.geofenceCenterLog]
                    };
              }
            })
            features.push(feature)
          }
        } 
        obj['features'] = features;
        return obj;
      }

        // update AssessmentProductionPlace disregard_status to true
    async updateDisregardStatus(dueDiligenceReportId: number, assessmentId: number):  Promise < {
            success: boolean,
            message: string
        } > {
        const transaction = await this.sequelize.transaction();
        try {
            // Fetch the relevant production places
            const productionPlaces = await this.diligenceReportProductionPlaceModel.findAll({
                where: {
                    diligenceReportId: dueDiligenceReportId,
                    removed: false,
                },
                include: [
                    {
                        model: AssessmentProductionPlace,
                        as: 'all_risk_assessments',
                        where: {
                            assessmentId: assessmentId,
                        },
                        required: true,
                    },
                ],
            });

            // Filter the production places to update
            const productionPlacesToUpdate = productionPlaces.filter((productionPlace) => {
                const allRiskAssessments = productionPlace.all_risk_assessments || [];
                return allRiskAssessments.length > 0 && allRiskAssessments.every(
                    (assessment) =>
                    assessment.riskAssessmentStatus !== null &&
                    assessment.riskAssessmentStatus !== RiskAssessmentStatus.APPROVED
                );
            });

            // Update the filtered production places
            const productionPlaceIdsToUpdate = productionPlacesToUpdate.map(place => place.id);
            await this.diligenceReportProductionPlaceModel.update({
                isDisregarded: true,
            }, {
                where: { id: { [Op.in]: productionPlaceIdsToUpdate } },
                transaction,
            });
            await transaction.commit();

            if (productionPlaceIdsToUpdate.length > 0) {
                return { success: true, message: `Disregard status updated successfully` };
            } else {
                return { success: false, message: "No production places found to update" };
            }
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async mitigateHighRiskAssessmentProductionPlace(
            input: MitigateProductionPlaceInput,
          ): Promise<{ success: boolean; message: string }> {
            const { dueDiligenceReportId, mitigationComment, file, assessmentId } = input;
            const transaction = await this.sequelize.transaction();
            try {
              // Fetch the relevant production places
              const productionPlaces = await this.productionPlaceModel.findAll({
                where: {
                  dueDiligenceReportId: dueDiligenceReportId,
                  removed: false,
                  disregard_status: false
                },
                include: [
                  {
                    model: AssessmentProductionPlace,
                    as: 'all_risk_assessments',
                    where: {
                      assessmentId: assessmentId,
                    },
                    required: true,
                  },
                ],
              });
        
              // Filter the production places to update
              const productionPlacesToUpdate = productionPlaces.filter((productionPlace) => {
                const allRiskAssessments = productionPlace.all_risk_assessments || [];
                return allRiskAssessments.length > 0 && allRiskAssessments.every(
                  (assessment) =>
                    assessment.riskAssessmentStatus === RiskAssessmentStatus.MITIGATION_REQUIRED 
                );
              });
        
              if (!productionPlacesToUpdate.length) {
                throw new Error('No Non-Compliant Farms Found');
              }
        
              for (const productionPlace of productionPlacesToUpdate) {
                for (const assessment of productionPlace.all_risk_assessments) {
                  assessment.riskAssessmentStatus = RiskAssessmentStatus.APPROVED;
                  assessment.comment = mitigationComment;
                  assessment.s3key = file;
                  await assessment.save({ transaction });
                }
              }
        
              await transaction.commit();
              return { success: true, message: 'Mitigation successful' };
            } catch (error) {
              await transaction.rollback();
              throw error;
            }
    }

      // remove AssessmentProductionPlace with riskAssessmentStatus = mitigation_required
      async removeAssessmentProductionPlaceWithMitigationRequired(dueDiligenceReportId: number): Promise<number> {
        const transaction = await this.sequelize.transaction();
        try {
          const result = await this.assessmentProductionPlaceService.destroy({
            where: {
              diligenceReportId: dueDiligenceReportId,
              riskAssessmentStatus: 'mitigation_required',
            },
            transaction,
          });
    
          await transaction.commit();
          return result;
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
      }
    
      async checkPolygonOverlap(
        id: number,
        orgId?: number
      ): Promise<{ success: boolean; message: string }> {
        const include = [
          {
            model: Farm,
            as: "farm",
            where: {
              isDeleted: 0,
            },
            required: true,
            include: [
              {
                model: Geofence,
                as: "GeoFences",
                required: false,
                include: [
                  {
                    model: GeofenceCoordinates,
                    as: "geofenceCoordinates",
                    required: false,
                  },
                ],
              },
            ],
          },
        ];
        const productionPlaces = await this.productionPlaceModel.findAll({
          include,
          where: {
            removed: 0,
            dueDiligenceReportid: id,
          },
        });
    
        let polygons = [];
        // Filter and convert production places to Turf.js polygon format
        for (const productionPlace of productionPlaces) {
          const primaryGeofence = productionPlace.farm.GeoFences.find(
            (gf) => gf.isPrimary
          );
    
          if (
            primaryGeofence &&
            primaryGeofence.geofenceCoordinates &&
            Array.isArray(primaryGeofence.geofenceCoordinates) &&
            primaryGeofence.geofenceCoordinates.length > 0
          ) {
            // Convert the coordinates to [lng, lat] and ensure numbers are used
            const coordinates = primaryGeofence.geofenceCoordinates.map((coord) => [
              Number(coord.log), // Ensure longitude is a number
              Number(coord.lat), // Ensure latitude is a number
            ]);
    
            // Ensure the polygon is closed (first and last coordinates are the same)
            if (
              coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
              coordinates[0][1] !== coordinates[coordinates.length - 1][1]
            ) {
              coordinates.push(coordinates[0]); // Close the polygon by repeating the first coordinate
            }
    
            // Add the polygon to the polygons array
            polygons.push({
              name: productionPlace.farm.farmName,
              polygon: turf.polygon([coordinates]), // Create a polygon using Turf.js
            });
          }
        }
    
        // If less than two polygons, no overlap can occur
        if (polygons.length <= 1) {
          return { success: true, message: "No overlaps detected." };
        }
    
        // Now that we have all polygons, let's check for overlap
        const overlaps = [];
        for (let i = 0; i < polygons.length; i++) {
          for (let j = i + 1; j < polygons.length; j++) {
            const overlap = turf.intersect(
              turf.featureCollection([polygons[i].polygon, polygons[j].polygon])
            );
            if (overlap) {
              overlaps.push(
                `Overlap detected between ${polygons[i].name ?? "-"} and ${
                  polygons[j].name ?? "-"
                }`
              );
            }
          }
        }    
        if (overlaps.length > 0) {
          return { success: false, message: overlaps.join("; ") };
        }
    
        return { success: true, message: "No overlap detected" };
      }

      async sendDisputeAlert(disputeId: number, disputeData: ProductionPlaceDisputes) {
        const getSuperAdminRoleUsers = await this.userModel.findAll({
            attributes:['cf_userid'],
            where:{
                role: Roles.SUPER_ADMIN
            }
        });
        const {title, message, type } = this.getTitleMessageLabel(disputeData.status)

        await this.messageQueueingService.publishNotification({
            title:title,
            message: message,
            type: type,
            notify: "admin",
            alertType: 'alert',
            userId: disputeData.createdBy,
            users: getSuperAdminRoleUsers.map(u=> u.cf_userid),
            data: JSON.stringify({
              disputeId: disputeId,
              redirectionPath:""
            })
          })
      }
getTitleMessageLabel(status:DisputeStatus ){
    let message = '';
    let title = '';
    let type = '';

    switch (status) {
        case DisputeStatus.OPEN:
            title = 'Dispute Creation Alert';
            message = 'A new dispute has been initiated  by the user. Please review the details and take the necessary action.';
            type = 'dispute_created';
        break;

        case DisputeStatus.CLOSED:
            title = 'Dispute Closed Alert';
            message = 'A new dispute has been closed  by the user. Please review the details and take the necessary action.';
            type = 'dispute_closed';

        break;
        case DisputeStatus.INFO_REQ:
            title = 'Dispute Info Required Alert';
            message = 'A new dispute info request been initiated  by the user. Please review the details and take the necessary action.';
            type = 'dispute_info_required';

        break;
        default:
         break;

        }
    return { title, message, type}
}

    /**
     * Process multiple CSV files: parse, convert to GeoJSON, and process as production places
     * @param files Express.Multer.File[]
     */
    async processCsvFiles(files: Express.Multer.File[], diligenceReport: DiligenceReport, userId: number, dds_user: any, token: string): Promise<Object> {
        let allFeatures: any[] = [];
        try {
            for (const file of files) {
                const csvContent = file.buffer.toString('utf-8');
                const records: Record<string, any>[] = csvParse.parse(csvContent, {
                    columns: true,
                    skip_empty_lines: true
                });
                for (const row of records) {  
                    // Map columns: 'Member Name' -> ProducerName, 'Member Number' -> used in Address, 'Coordinates' for geometry, 'Area' for area
                    const producerName = row['Member Name'] || '';
                    const memberNumber = row['Member Number'] || '';
                    const address = `Address of ${memberNumber}`;
                    const producerCountry = row['Producer Country'] || '';
                    const coordinatesStr = row['Coordinates'] || '';
                    const areaStr = row['Area'] || '';
                    let coordinates: any = [];
                    let valid = true;
                    let geometry = null;
                    let area = null;
                    try {
                        coordinates = JSON.parse(coordinatesStr);
                        // Detect Point: single pair
                        if (
                            Array.isArray(coordinates) &&
                            coordinates.length === 2 &&
                            coordinates.every(Number.isFinite)
                        ) {
                            // Assume coordinates are in [lat, lng] format, convert to GeoJSON [lng, lat] format
                            geometry = {
                                type: 'Point',
                                coordinates: [coordinates[1], coordinates[0]]
                            };
                        } else if (
                            Array.isArray(coordinates) &&
                            coordinates.length >= 3 &&
                            coordinates.every(pair => Array.isArray(pair) && pair.length === 2 && pair.every(Number.isFinite))
                        ) {
                            // Array of pairs: Polygon
                            // Ensure closed
                            if (
                                coordinates[0][0] !== coordinates[coordinates.length-1][0] ||
                                coordinates[0][1] !== coordinates[coordinates.length-1][1]
                            ) {
                                coordinates.push([...coordinates[0]]);
                            }
                            geometry = {
                                type: 'Polygon',
                                coordinates: [coordinates]
                            };
                        } else {
                            valid = false;
                        }
                    } catch (e) {
                        // Try to parse coordinates
                        coordinates = parseCoordinate(coordinatesStr);
                        if (coordinates) {
                            if (Array.isArray(coordinates) && coordinates.length === 2 && coordinates.every(Number.isFinite)) {
                                // Single [lng, lat] pair: Point
                                geometry = {
                                    type: 'Point',
                                    coordinates: coordinates
                                };
                            } else if (Array.isArray(coordinates) && coordinates.length >= 3 && 
                                     coordinates.every(pair => Array.isArray(pair) && pair.length === 2 && pair.every(Number.isFinite))) {
                                // Array of coordinate pairs: Polygon
                                // Ensure closed polygon
                                if (coordinates.length > 0 && 
                                    (coordinates[0][0] !== coordinates[coordinates.length-1][0] ||
                                     coordinates[0][1] !== coordinates[coordinates.length-1][1])) {
                                    coordinates.push([...coordinates[0]]);
                                }
                                geometry = {
                                    type: 'Polygon',
                                    coordinates: [coordinates]
                                };
                            } else {
                                valid = false;
                            }
                        } else {
                            valid = false;
                        }
                    }
                    if (!valid || !geometry) {
                        // Not enough points for a polygon or invalid point
                        console.log('Invalid geometry - skipping row');
                        continue;
                    }
                    
                    // Parse area if available (for Point geometries)
                    if (areaStr && geometry.type === 'Point') {
                        // Handle both comma and dot decimal separators
                        const normalizedAreaStr = String(areaStr).replace(/,/g, '.');
                        const parsedArea = parseFloat(normalizedAreaStr);
                        if (!isNaN(parsedArea) && parsedArea > 0) {
                            area = parsedArea;
                        }
                    }
                    
                    const feature = {
                        type: 'Feature',
                        properties: {
                            ProductionPlace: producerCountry, // or another column if you have a specific one for place
                            ProducerName: producerName,
                            ProducerCountry: producerCountry,
                            Address: address,
                            ...(area && { Area: area }) // Add area only if it exists
                        },
                        geometry: geometry
                    };
                    allFeatures.push(feature);
                }
            }
            const featureCollection = {
                type: 'FeatureCollection',
                features: allFeatures
            };
            // Process as geojson
            const job = await this.createJobForGeoJson(
                diligenceReport,
                featureCollection,
                dds_user,
                token,
                userId
            );
            diligenceReport.productionPlaceSource = 'import';
            diligenceReport.status = 'Processing Farms';
            await diligenceReport.save();
            const jobData = job.toJSON();
            delete jobData.payload;
            return {
                success: true,
                job: jobData,
                message: 'Successfully imported production place from CSV.'
            };
        } catch (error) {
            throw new Error('Failed to process CSV files: ' + error.message);
        }
    }

    /**
     * Process multiple Excel files: parse, convert to GeoJSON, and process as production places
     * @param files Express.Multer.File[]
     */
    async processExcelFiles(files: Express.Multer.File[], diligenceReport: DiligenceReport, userId: number, dds_user: any, token: string): Promise<Object> {
        let allFeatures: any[] = [];
        try {
            for (const file of files) {
                // Read buffer as workbook
                const workbook = XLSX.read(file.buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const records: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                for (const row of records) {

                    // Map columns: 'Member Name' -> ProducerName, 'Member Number' -> used in Address, 'Coordinates' for geometry, 'Area' for area
                    const producerName = row['Member Name'] || '';
                    const memberNumber = row['Member Number'] || '';
                    const address = `Address of ${memberNumber}`;
                    const producerCountry = row['Producer Country'] || '';
                    const coordinatesStr = row['Coordinates'] || '';
                    const areaStr = row['Area'] || '';
                    let coordinates: any = [];
                    let valid = true;
                    let geometry = null;
                    let area = null;
                    try {
                        coordinates = JSON.parse(coordinatesStr);
                        // Detect Point: single pair
                        if (
                            Array.isArray(coordinates) &&
                            coordinates.length === 2 &&
                            coordinates.every(Number.isFinite)
                        ) {
                            // Assume coordinates are in [lat, lng] format, convert to GeoJSON [lng, lat] format
                            geometry = {
                                type: 'Point',
                                coordinates: [coordinates[1], coordinates[0]]
                            };
                        } else if (
                            Array.isArray(coordinates) &&
                            coordinates.length >= 3 &&
                            coordinates.every(pair => Array.isArray(pair) && pair.length === 2 && pair.every(Number.isFinite))
                        ) {
                            // Array of pairs: Polygon
                            // Ensure closed
                            if (
                                coordinates[0][0] !== coordinates[coordinates.length-1][0] ||
                                coordinates[0][1] !== coordinates[coordinates.length-1][1]
                            ) {
                                coordinates.push([...coordinates[0]]);
                            }
                            geometry = {
                                type: 'Polygon',
                                coordinates: [coordinates]
                            };
                        } else {
                            valid = false;
                        }
                    } catch (e) {
                        // Try to parse coordinates
                        coordinates = parseCoordinate(coordinatesStr);                        
                        if (coordinates) {
                            if (Array.isArray(coordinates) && coordinates.length === 2 && coordinates.every(Number.isFinite)) {
                                // Single [lng, lat] pair: Point
                                geometry = {
                                    type: 'Point',
                                    coordinates: coordinates
                                };
                                console.log('Created Point geometry from coordinate parsing:', geometry);
                            } else if (Array.isArray(coordinates) && coordinates.length >= 3 && 
                                     coordinates.every(pair => Array.isArray(pair) && pair.length === 2 && pair.every(Number.isFinite))) {
                                // Array of coordinate pairs: Polygon
                                // Ensure closed polygon
                                if (coordinates.length > 0 && 
                                    (coordinates[0][0] !== coordinates[coordinates.length-1][0] ||
                                     coordinates[0][1] !== coordinates[coordinates.length-1][1])) {
                                    coordinates.push([...coordinates[0]]);
                                }
                                geometry = {
                                    type: 'Polygon',
                                    coordinates: [coordinates]
                                };
                            } else {
                                valid = false;
                            }
                        } else {
                            valid = false;
                        }
                    }
                    if (!valid || !geometry) {
                        console.log('Invalid geometry - skipping row');
                        continue;
                    }
                    
                    // Parse area if available (for Point geometries)
                    if (areaStr && geometry.type === 'Point') {
                        // Handle both comma and dot decimal separators
                        const normalizedAreaStr = String(areaStr).replace(/,/g, '.');
                        const parsedArea = parseFloat(normalizedAreaStr);
                        if (!isNaN(parsedArea) && parsedArea > 0) {
                            area = parsedArea;
                        }
                    }
                    
                    const feature = {
                        type: 'Feature',
                        properties: {
                            ProductionPlace: producerCountry, // or another column if you have a specific one for place
                            ProducerName: producerName,
                            ProducerCountry: producerCountry,
                            Address: address,
                            ...(area && { Area: area }) // Add area only if it exists
                        },
                        geometry: geometry
                    };
                    allFeatures.push(feature);
                }
            }
            const featureCollection = {
                type: 'FeatureCollection',
                features: allFeatures
            };
            // Process as geojson
            const job = await this.createJobForGeoJson(
                diligenceReport,
                featureCollection,
                dds_user,
                token,
                userId
            );
            diligenceReport.productionPlaceSource = 'import';
            diligenceReport.status = 'Processing Farms';
            await diligenceReport.save();
            const jobData = job.toJSON();
            delete jobData.payload;
            return {
                success: true,
                job: jobData,
                message: 'Successfully imported production place from Excel.'
            };
        } catch (error) {
            throw new Error('Failed to process Excel files: ' + error.message);
        }
    }
}

function parseDmsOrDd(str) {
    console.log('parseDmsOrDd input:', str);
    let sign = 1;
    if (/S|W/i.test(str)) sign = -1;
    str = str.replace(/[NSEW]/gi, '').trim();
    console.log('After removing cardinal directions:', str);

    // Check for DMS format (contains ' or ")
    if (/['"]/.test(str)) {
        const dmsPattern = /(\d+)[°º]\s*(\d+)?['’]?\s*(\d+(?:[.,]\d+)?)?["”]?/;
        const match = str.match(dmsPattern);
        if (match) {
            const degrees = parseFloat(match[1]);
            const minutes = match[2] ? parseFloat(match[2]) : 0;
            const seconds = match[3] ? parseFloat(match[3].replace(/,/g, '.')) : 0;
            const value = degrees + (minutes / 60) + (seconds / 3600);
            return sign * value;
        } else {
            return null;
        }
    } else {
        const value = parseFloat(str.replace(/[°º]/g, '').replace(/,/g, '.'));
        if (!isNaN(value)) {
            // Check if the original string had a negative sign
            const originalValue = parseFloat(str.replace(/[°º]/g, '').replace(/,/g, '.'));
            const finalValue = originalValue < 0 ? originalValue : sign * value;
            return finalValue;
        } else {
            return null;
        }
    }
}

// Function to parse coordinate strings and return [lng, lat] or array of coordinates for polygons
function parseCoordinate(coordStr) {
    coordStr = coordStr.replace(/[\[\]]/g, '').trim();

    // Check if this is a polygon (multiple coordinate pairs separated by semicolon)
    if (coordStr.includes(';')) {
        const coordinatePairs = coordStr.split(';').map(s => s.trim()).filter(s => s.length > 0);
        
        const coordinates = [];
        for (const pair of coordinatePairs) {
            const coords = parseSingleCoordinatePair(pair);
            if (coords) {
                coordinates.push(coords);
            } else {
                return null;
            }
        }
        
        if (coordinates.length >= 3) {
            return coordinates;
        } else {
            return null;
        }
    } else {
        // Single coordinate pair
        return parseSingleCoordinatePair(coordStr);
    }
}

// Helper function to parse a single coordinate pair
function parseSingleCoordinatePair(coordStr) {
    
    // Handle DMS coordinates with commas in seconds (e.g., "7°7' 51,591" S,107°46' 8,223" E")
    // We need to find the comma that separates the two coordinates, not commas within DMS
    let commaIndex = -1;
    
    // Look for comma followed by a number and degree symbol or cardinal direction
    const commaMatch = coordStr.match(/,(\s*\d+[°º]|\s*[NSEW])/);
    if (commaMatch) {
        commaIndex = coordStr.indexOf(',', commaMatch.index);
    } else {
        // Fallback: split by comma and hope for the best
        const parts = coordStr.split(',').map(s => s.trim());
        if (parts.length >= 2) {
            const part1 = parts[0];
            const part2 = parts[1];
            
            const value1 = parseDmsOrDd(part1);
            const value2 = parseDmsOrDd(part2);
            
            if (value1 === null || value2 === null) {
                return null;
            }
            
            let lat, lng;
            if (/[NS]/i.test(part1)) lat = value1;
            else if (/[EW]/i.test(part1)) lng = value1;
            if (/[NS]/i.test(part2)) lat = value2;
            else if (/[EW]/i.test(part2)) lng = value2;
            
            // If no cardinal directions found, assume first value is latitude, second is longitude
            if (lat === undefined && lng === undefined) {
                lat = value1;
                lng = value2;
            }
            
            if (lat === undefined || lng === undefined) {
                return null;
            }
            
            const result = [lng, lat];
            return result;
        } else {
            return null;
        }
    }
    
    if (commaIndex === -1) {
        return null;
    }
    
    const part1 = coordStr.substring(0, commaIndex).trim();
    const part2 = coordStr.substring(commaIndex + 1).trim();
    
    const value1 = parseDmsOrDd(part1);
    const value2 = parseDmsOrDd(part2);
    
    if (value1 === null || value2 === null) {
        return null;
    }
    
    let lat, lng;
    if (/[NS]/i.test(part1)) lat = value1;
    else if (/[EW]/i.test(part1)) lng = value1;
    if (/[NS]/i.test(part2)) lat = value2;
    else if (/[EW]/i.test(part2)) lng = value2;
    
    if (lat === undefined || lng === undefined) {
        return null;
    }
    
    const result = [lng, lat];
    return result;
}

// Example usage within processCsvFiles (partial implementation)
function processRow(row) {
    const coordinatesStr = row['Coordinates'] || '';
    let geometry = null;

    try {
        const coordinates = JSON.parse(coordinatesStr);
        if (Array.isArray(coordinates) && coordinates.length === 2 && coordinates.every(Number.isFinite)) {
            // Assume [lat, lng] for JSON, swap to [lng, lat]  
            geometry = { type: 'Point', coordinates: [coordinates[1], coordinates[0]] };
        }
    } catch (e) {
        const parsed = parseCoordinate(coordinatesStr);
        if (parsed) {
            geometry = { type: 'Point', coordinates: parsed };
        }
    }

    if (geometry) {
        const feature = {
            type: 'Feature',
            properties: {
                ProducerName: row['Member Name'] || '',
                Address: `Address of ${row['Member Number'] || ''}`,
                Area: parseFloat((row['Area'] || '').replace(/,/g, '.')) || null
            },
            geometry
        };
        return feature;
    }
    return null;
}
