import {
  BadRequestException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import {
  CoordinatesObj,
  CreateDeforestationInput,
  GetCertificateInput,
  GetCertificateInputAdmin,
  GetDeforestationInput,
  IPythonResponse,
  ReportStatus,
  AdminDisplayType,
  UserUnitInput,
  ReportType,
  IBlockChainData,
  AverageProb,
  EUDRDeforestationStatusInput,
  DetectDeforestationBulkInput,
} from "./dto/create-deforestation.input";
import { UpdateDeforestationInput } from "./dto/update-deforestation.input";
import { Op, QueryTypes, Sequelize as sequelize } from "sequelize";
import { DeforestationReportRequest } from "./entities/deforestation_report_request.entity";
import { ReportRequestCoordinates } from "./entities/request-coordinates.entity";
import { ApiCallHelper, wait, withRetry } from "src/helpers/api-call.helper";
import { RequestMethod } from "src/helpers/helper.interfaces";
import {
  ALLOWED_COUNTRY,
  CONSTANT,
  MAX_NO_OF_DEFORESTATION_REPORTS,
  MAX_NO_OF_DEFORESTATION_REPORTS_PER_FARM,
  URL,
} from "src/config/constant";
import { DeforestrationSateliteResponse } from "./entities/deforestation_satelite_response.entity";
import {
  checkIfHasExistsInChain,
  getFeeData,
  initializeEtherContract,
} from "./contract";
import { Logger } from '@nestjs/common';
import * as uuid from "uuid";
import { FarmsService } from "src/farms/farms.service";
import { ethers, utils } from "ethers";
import { S3 } from "./s3.service";
import { toDataURL } from "qrcode";
import { Farm } from "src/farms/entities/farm.entity";
import { FarmCoordinates } from "src/farms/entities/farmCoordinates.entity";
import * as moment from "moment";
import { User } from "src/users/entities/user.entity";
import { Geofence } from "src/geofence/entities/geofence.entity";
import { GeofenceCoordinates } from "src/geofence/entities/geofenceCoordinates.entity";
import { Organization } from "src/users/entities/organization.entity";
import { DeforestationHelperService } from "./deforestation.helper";
import { I18nService } from "nestjs-i18n";
import { camelCase, snakeCase } from 'lodash';
import { DueDiligenceProductionPlace, EudrDeforestationStatus } from "src/due-diligence/production-place/entities/production-place.entity";
import { UserDDS } from 'src/users/entities/dds_user.entity';
import axios from 'axios';
import { JobService } from 'src/job/job.service';
import { BaseJobQueueable } from 'src/base-job-queueable';
import { Job, JobStatus } from 'src/job/entities/job.entity';
import { DiligenceReport } from 'src/diligence-report/entities/diligence-report.entity';
import { EudrSetting } from 'src/eudr-settings/entities/eudr-setting.entity';
import { DeforestationAssessmentRiskToleranceLevels } from 'src/eudr-settings/entities/deforestation-assessment-risk-tolerance-levels.entity';
import { MessageQueueingService } from "src/message-queueing/message-queueing.service";
import { DiligenceReportProductionPlace } from 'src/diligence-report/entities/diligence-report-production-place.entity';
import { ProductionPlaceDeforestationInfo } from 'src/due-diligence/production-place/entities/production-place-deforestation-info.entity';
import { DueDiligenceProductionPlacesPyData } from "./entities/due_diligence_production_places_py_data.entity";
import { SolanaService } from 'src/solana/solana.service';
import { DeforestationDataOnSolana } from 'src/solana/solana.interface';
import COUNTRIES from 'src/config/country';
import { getContinents, lookUp } from 'geojson-places';
import { report } from 'process';
import { HISTORICAL_DEFORESTATION_WRITE_CONFIG } from './historical-deforestation-write.config';
// import { getBalance, initializeContract } from "./zkENV";

@Injectable()
export class DeforestationService extends BaseJobQueueable {
  private readonly logger = new Logger(DeforestationService.name);
  constructor(
    @InjectModel(DeforestationReportRequest)
    private deforestationReportRequestModel: typeof DeforestationReportRequest,
    @InjectModel(FarmCoordinates)
    private FarmCoordinatesModelModel: typeof FarmCoordinates,
    @InjectModel(ReportRequestCoordinates)
    private coordinatesModel: typeof ReportRequestCoordinates,
    @InjectModel(DeforestrationSateliteResponse)
    private deforestationSateliteResponseModel: typeof DeforestrationSateliteResponse,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Farm)
    private farmModel: typeof Farm,
    @InjectModel(Geofence)
    private GeofenceModel: typeof Geofence,
    @InjectModel(GeofenceCoordinates)
    private GeofenceCoordinatesModel: typeof GeofenceCoordinates,
    @InjectModel(Organization)
    private OrgModel: typeof Organization,
    @InjectModel(DueDiligenceProductionPlace)
    private dueDiligenceProductionPlaceModel: typeof DueDiligenceProductionPlace,
    @InjectModel(DiligenceReport)
    private DiligenceReportModel: typeof DiligenceReport,
    @InjectModel(EudrSetting)
    private EudrSettingModel: typeof EudrSetting,
    @InjectModel(DiligenceReportProductionPlace)
    private ReportProductionPlaceModel: typeof DiligenceReportProductionPlace,
    @InjectModel(ProductionPlaceDeforestationInfo)
    private PlaceDeforestationInfoModel: typeof ProductionPlaceDeforestationInfo,

    @Inject('SEQUELIZE')
    private readonly sequelize: Sequelize,

    @Inject(forwardRef(() => JobService))
    private jobService: JobService,

    private apiCallHelper: ApiCallHelper,

    private farmService: FarmsService,

    private s3Service: S3,

    private readonly deforestationHelperService: DeforestationHelperService,

    private readonly i18n: I18nService,

    private readonly messageQueueingService: MessageQueueingService,

    @Inject(SolanaService)
    private readonly solanaService: SolanaService,
  ) {
    super();
  }

  // Calculating center-latitude and center-longitude
  calculateCenterofPolygon = (coordinates) => {
    var x = coordinates.map(function (a) {
      return a['latitude'];
    });
    var y = coordinates.map(function (a) {
      return a['longitude'];
    });
    var minX = Math.min(...x);
    var maxX = Math.max(...x);
    var minY = Math.min(...y);
    var maxY = Math.max(...y);
    return [(minX + maxX) / 2, (minY + maxY) / 2];
  };

  async getRegions() {
    const endpoint = URL.BASEURL + URL.GET_REGIONS;
    let { status, data } = await this.apiCallHelper.call<IPythonResponse>(
      RequestMethod.GET,
      endpoint,
      {
        'Auth-Token': CONSTANT.DEFORESTATION_API_KEY,
      },
      {}
    );
    return data;
  }

  async create(createDeforestationInput: CreateDeforestationInput, userId: number, lang: string) {
    console.log({ userId });
    let t = await this.sequelize.transaction();
    try {
      let {
        locationInfo,
        locationName,
        farmId,
        country,
        state,
        geofenceArea,
        dimitraUserId,
        dimitraFarmId,
        farmRegistrationId,
        farmerRegistrationId,
        radius,
        reportType,
        zoneId,
        reportLimit,
        reportTypeUnit,
        reportDuration,
      } = createDeforestationInput;

      // create user and farm if not exist
      await this.createUserAndFarm(createDeforestationInput, userId, t, reportType, lang);

      // const existingReportOfFarm =
      //   await this.deforestationReportRequestModel.findAll({
      //     where: { farmId: farmId, is_deleted: 0 },
      //     order: [["created_at", "DESC"]],
      //     include: [
      //       {
      //         model: Farm,
      //         attributes: ["farmName", "farmOwner"],
      //         as: "farm",
      //         required: true,
      //       },
      //     ],
      //   });

      // this is to check geofence update change, if geofence updated then generate report else dont
      // if (
      //   existingReportOfFarm?.length >= MAX_NO_OF_DEFORESTATION_REPORTS_PER_FARM
      // ) {
      //   // if report exists check if changes have been made to geofence

      //   let geofenceRes = await this.FarmCoordinatesModelModel.findAll({
      //     where: {
      //       farmId: farmId,
      //     },
      //   });
      //   if (
      //     geofenceRes &&
      //     Array.isArray(geofenceRes) &&
      //     geofenceRes.length > 0
      //   ) {
      //     if (
      //       new Date(geofenceRes[0].updatedAt).getTime() >
      //       new Date(existingReportOfFarm[0].createdAt).getTime()
      //     ) {
      //       // check if existing report request creation date precedes geofence changes
      //       // do nothing if geofence has been updated
      //     } else {
      //       throw new HttpException(
      //         `Deforestation Report for farm ${existingReportOfFarm[0]?.farm?.farmName} with same geofence has already been requested.`,
      //         400
      //       );
      //     }
      //   }
      //   console.log(geofenceRes);
      // }

      const limitCount = await this.deforestationHelperService.getDeforestationReportCount(
        userId,
        reportTypeUnit === 'per_farm' ? createDeforestationInput.farmId : null,
        reportDuration
      );

      // limit the deforestation report if type is user
      if (Number.isInteger(reportLimit) && limitCount >= reportLimit) {
        throw new HttpException(
          this.i18n.translate('message.deforestation.deforestationReportLimit', { lang: lang, args: { reportLimit } }),
          400
        );
      }

      // if (deforestationReportCount >= MAX_NO_OF_DEFORESTATION_REPORTS) {
      //   throw new HttpException(
      //     `Only ${MAX_NO_OF_DEFORESTATION_REPORTS} deforestation reports are allowed.`,
      //     400
      //   );
      // }

      // if (!ALLOWED_COUNTRY.includes(country.toUpperCase())) {
      //   throw new HttpException(
      //     `The requested region is not supported. Please contact admin for it or request the report for the supported region.`,
      //     400
      //   );
      // }

      let set: any = {
        reportGuid: uuid.v4(),
        userId,
        farmId,
        farmerUUID: dimitraUserId || uuid.v4(),
        farmUUID: dimitraFarmId || uuid.v4(),
        farmRegistrationId,
        farmerRegistrationId,
        country,
        state,
        locationName,
        centerLatitude: 0,
        centerLongitude: 0,
        deforestationPercent: '0.0',
        geofenceArea: '0.0',
        deforestationArea: 0,
        forestArea2020: 0,
        forestArea2022: 0,
        treeGainPercent: '0.0',
        treeGainArea: 0,
        forestArea2020Percent: 0,
        forestArea2022Percent: 0,
        reportType: reportType,
        radius,
        zoneName: createDeforestationInput.zoneName,
        referenceEndDate: moment(new Date().toISOString()).format('YYYY-MM-DD'),
        referenceStartDate: '2020-12-31',
        farmerName: '',
        farmName: '',
        orgId: '',
        treeUnchanged: null,
        treeUnchangedPercent: null,
        zoneId,
        highProb: 0,
        highProbPercent: 0,
        lowProb: 0,
        lowProbPercent: 0,
        totalArea: 0,
        zeroProb: 0,
        zeroProbPercent: 0,
        overallProb: '',
      };

      const centroidPolygon = await this.calculateCenterofPolygon(locationInfo.coordinates);
      set.centerLatitude = isNaN(centroidPolygon[0]) ? 0 : centroidPolygon[0];
      set.centerLongitude = isNaN(centroidPolygon[1]) ? 0 : centroidPolygon[1];

      const coordinates = locationInfo.coordinates;

      const baseUrl = URL.BASEURL;
      let endpoint =
        reportType == 'REGISTERED_FARM' || !createDeforestationInput.OrgObj //backward compatibilty
          ? URL.DETECT_DEFORESTATION_POLYGON
          : URL.DETECT_DEFORESTATION_CIRCLE;

      // handle circular registered farm
      if (radius) {
        endpoint = URL.DETECT_DEFORESTATION_CIRCLE;
      }
      const url = baseUrl + endpoint;
      let unixStamp = new Date().getTime();
      let pythonReqObj: any ={};
      if (reportType === 'REGISTERED_FARM' || !createDeforestationInput.OrgObj) {
        if (!radius) {
          pythonReqObj = {
            userId: +userId,
            aoiId: farmId ? farmId : farmRegistrationId ? `${farmRegistrationId}${unixStamp}` : unixStamp, //if farmId use farmId, if farmUUID use farmUUID, if not use uuid
            // aoiId: farmId ? `${farmId}-${uuidv4()}` : farmUUID ? `${farmUUID}-${uuidv4()}`: uuidv4(), //if farmId use farmId, if farmUUID use farmUUID, if not use uuid
            // country,
            // state,
            coordinates,
            language: lang,
          };
        } else {
          // set these because we arent doing centroid stuff when its radius method
          set.centerLatitude = createDeforestationInput.FarmObj.lat;
          set.centerLongitude = createDeforestationInput.FarmObj.log;

          pythonReqObj = {
            language: lang,
            userId: +userId,
            aoiId: farmId
              ? `${farmId}`
              : `${farmRegistrationId}`
              ? `${farmRegistrationId}${unixStamp}`
              : unixStamp.toString(), //if farmId use farmId, if farmUUID use farmUUID, if not use uuid
            // aoiId: farmId ? `${farmId}-${uuidv4()}` : farmUUID ? `${farmUUID}-${uuidv4()}`: uuidv4(), //if farmId use farmId, if farmUUID use farmUUID, if not use uuid
            latitude: createDeforestationInput.FarmObj.lat,
            longitude: createDeforestationInput.FarmObj.log,
            radius: radius / 1000, // convert to KM, appside sends in meters
          };
        }
        //backward compatibilty
      } else {
        // set these because we aren't doing centroid stuff when its radius method
        set.centerLatitude = createDeforestationInput.FarmObj.lat;
        set.centerLongitude = createDeforestationInput.FarmObj.log;

        pythonReqObj = {
          language: lang,
          userId: +userId,
          aoiId: farmId
            ? `${farmId}`
            : `${farmRegistrationId}`
            ? `${farmRegistrationId}${unixStamp}`
            : unixStamp.toString(), //if farmId use farmId, if farmUUID use farmUUID, if not use uuid
          // aoiId: farmId ? `${farmId}-${uuidv4()}` : farmUUID ? `${farmUUID}-${uuidv4()}`: uuidv4(), //if farmId use farmId, if farmUUID use farmUUID, if not use uuid
          latitude: createDeforestationInput.FarmObj.lat,
          longitude: createDeforestationInput.FarmObj.log,
          radius: radius / 1000, // convert to KM, appside sends in meters
        };
      }

      console.log('deforesation url log', url);
      console.log('DEFORESTATION_API_KEY', CONSTANT.DEFORESTATION_API_KEY);
      console.log('pythonReqObj', pythonReqObj);
      console.log('createDeforestationInput', createDeforestationInput);
      console.log(JSON.stringify(pythonReqObj));

      let status: number;
      let data: IPythonResponse;
      try {
        const response = await this.apiCallHelper.call<IPythonResponse>(
          RequestMethod.POST,
          url,
          {
            'Auth-Token': CONSTANT.DEFORESTATION_API_KEY,
          },
          pythonReqObj
        );
        console.log(response, 'python response');
        if( response?.data?.error) {
          throw new Error('pythonServerError'); 
        }
        status = response.status;
        data = response.data;
      } catch (err) {
        throw new Error('pythonServerError');
      }

      if (status >= 500) {
        throw new HttpException(this.i18n.translate('message.deforestation.deforestationCreateError', { lang }), 400);
      }

      if (!data.success) {
        throw new HttpException(data.message, 400);
        // throw new HttpException(this.i18n.translate('message.deforestation.requestAreaLarge',{lang}), 400);
      }

      //Python result response
      let results = data.result;
      if (!results) {
        throw new HttpException(this.i18n.translate('message.deforestation.noDataFromPythonServer', { lang }), 404);
      }

      const veryHighProbConfig = CONSTANT.DEFORESTATION_STATUS_CONFIG.find((config) => config.label === 'Very High');
      const highProbConfig = CONSTANT.DEFORESTATION_STATUS_CONFIG.find((config) => config.label === 'High');
      const mediumProbConfig = CONSTANT.DEFORESTATION_STATUS_CONFIG.find((config) => config.label === 'Medium');
      const lowProbConfig = CONSTANT.DEFORESTATION_STATUS_CONFIG.find((config) => config.label === 'Low');
      const veryLowProbConfig = CONSTANT.DEFORESTATION_STATUS_CONFIG.find((config) => config.label === 'Very Low');
      const zeroProbConfig = CONSTANT.DEFORESTATION_STATUS_CONFIG.find((config) => config.label === 'Zero');

      // set.geofenceArea = geofenceArea?.toFixed(2) || results.totalArea;
      set.geofenceArea = geofenceArea
        ? geofenceArea.toFixed(2) || results.totalArea.toFixed(2)
        : parseFloat(createDeforestationInput.FarmObj.area).toFixed(2); // convert to hectare statically for now, we always expect in acre from appside for now
      // set.forestArea2020 = results.treeCover2020;
      // set.forestArea2020Percent = results.treeCover2020Percent;
      // set.forestArea2022 = results[`treeCover${new Date().getFullYear()}`];
      // set.forestArea2022Percent =
      // results[`treeCover${new Date().getFullYear()}Percent`];
      // set.treeGainPercent = results.treeGainPercent?.toFixed(2);
      // set.treeGainArea = results.treeGain;
      // set.deforestationPercent = results.treeLossPercent?.toFixed(2);
      // set.referenceStartDate = results.referenceStartDate || "2020-12-31";
      // set.referenceEndDate =
      // results.referenceEndDate ||
      // moment(new Date().toISOString()).format("YYYY-MM-DD");
      set.farmerName =
        createDeforestationInput.FarmObj.farmOwner ||
        `${createDeforestationInput.UserObj.firstName} ${createDeforestationInput.UserObj.lastName}`;
      set.farmName = createDeforestationInput.FarmObj.farmName;
      if (createDeforestationInput.OrgObj) {
        set.orgId = createDeforestationInput.OrgObj.id + '';
        // set.deforestationArea = results.treeLoss;
        // set.treeUnchanged = results.treeUnchanged;
        // set.treeUnchangedPercent = results.treeUnchangedPercent;
        set.highProb = results.highProb * 2.471; // convert to acre since we get in hectare from python, acre is default unit for us
        set.highProbPercent = results.highProbPercent;
        set.highProbColor = results.highProbColor || highProbConfig.colorCode;
        set.highProbColorName = results.highProbColorName || highProbConfig.colorName;
        set.lowProb = results.lowProb * 2.471; // convert to acre since we get in hectare from python, acre is default unit for us
        set.lowProbPercent = results.lowProbPercent;
        set.lowProbColor = results.lowProbColor || lowProbConfig.colorCode;
        set.lowProbColorName = results.lowProbColorName || lowProbConfig.colorName;
        set.totalArea = results.totalArea * 2.471; // convert to acre since we get in hectare from python, acre is default unit for us
        set.zeroProb = results.zeroProb * 2.471; // convert to acre since we get in hectare from python, acre is default unit for us
        set.zeroProbPercent = results.zeroProbPercent;
        set.zeroProbColor = results.zeroProbColor || zeroProbConfig.colorCode;
        set.zeroProbColorName = results.zeroProbColorName || zeroProbConfig.colorName;
        set.overallProb = results.overallProb;
        set.mediumProb = results.mediumProb * 2.471; // convert to acre since we get in hectare from python, acre is default unit for us;
        set.mediumProbPercent = results.mediumProbPercent;
        set.mediumProbColor = results.mediumProbColor || mediumProbConfig.colorCode;
        set.mediumProbColorName = results.mediumProbColorName || mediumProbConfig.colorName;
        set.veryHighProb = results.veryHighProb * 2.471; // convert to acre since we get in hectare from python, acre is default unit for us;
        set.veryHighProbPercent = results.veryHighProbPercent;
        set.veryHighProbColor = results.veryHighProbColor || veryHighProbConfig.colorCode;
        set.veryHighProbColorName = results.veryHighProbColorName || veryHighProbConfig.colorName;
        set.veryLowProb = results.veryLowProb * 2.471; // convert to acre since we get in hectare from python, acre is default unit for us;
        set.veryLowProbPercent = results.veryLowProbPercent;
        set.veryLowProbColor = results.veryLowProbColor || veryLowProbConfig.colorCode;
        set.veryLowProbColorName = results.veryLowProbColorName || veryLowProbConfig.colorName;
      }
      set.title = data.title;
      set.reportVersion = data.reportVersion;
      set.modelVersion = data.modelVersion;
      set.geometryType = data.geometryType;
      set.issueDate = data.issueDate;
      set.circularDataSHA256 = data.circularDataSHA256;
      set.polygonalDataSHA256 = data.polygonalDataSHA256;

      if(results.country) set.country = results.country.name;

      console.log(set);

      const reportRequest = await this.deforestationReportRequestModel.create(
        { ...set },
        {
          transaction: t,
        }
      );

      const reportCoordinates = coordinates.map((data) => {
        const { latitude, longitude } = data;
        return {
          reportRequestId: reportRequest.id,
          latitude: latitude,
          longitude: longitude,
        };
      });

      // insert data into the report coordinates
      await this.coordinatesModel.bulkCreate(reportCoordinates, {
        transaction: t,
      });

      const resultWithImage = await this.getDeforestationReportSateliteData(
        reportRequest.id,
        results.allProbImageS3Key,
        results.finalDetectionS3Key
      );
      await this.deforestationSateliteResponseModel.bulkCreate(resultWithImage);
      await t.commit();
      if(!reportRequest.errorStatus) {
        await this.writeDeforestationDataToSolana({
          transactableId: reportRequest.id,
          farm: reportRequest.farmUUID,
          indigenousArea: results?.indigenousLand?.length ? results.indigenousLand[0] : 'No',
          protectedArea: results?.protectedAreasAlerts?.length ? results.protectedAreasAlerts[0] : 'No',
          deforestationStatus: reportRequest.originalOverallProb || reportRequest.overallProb,
          reportVersion: reportRequest.reportVersion,
          country: reportRequest.country,
        });
      }
      // this.writeToBlockChain(reportRequest, coordinates, resultWithImage);
      return this.i18n.translate('message.deforestation.deforestationReportSuccess', { lang });
    } catch (err) {
      t.rollback();
      // When python server throws error, it will be caught here
      if (err.message === 'pythonServerError') {
        throw new HttpException(this.i18n.translate('message.deforestation.deforestationCreateError', { lang }), 400);
      }
      if (err?.status == 401 && err.message) {
        throw new HttpException(err.message, err.status || 500);
      }
      throw new HttpException(
        err.message || this.i18n.translate('message.deforestation.deforestationReportError', { lang }),
        err.status || 500
      );
    }
  }

  async getImageData(image2020S3Key, finalResultS3Key) {
    const params2020 = {
      Bucket: 'dimitra-deforestation-result-images',
      Key: image2020S3Key,
    };
    const paramFinalImage = {
      Bucket: 'dimitra-deforestation-result-images',
      Key: finalResultS3Key,
    };
    const { Body: body2020 } = await this.s3Service.s3.getObject(params2020).promise();
    const { Body: bodyFinal } = await this.s3Service.s3.getObject(paramFinalImage).promise();
  }

  async writeToBlockChain(
    report: DeforestationReportRequest,
    coordinates: CoordinatesObj[],
    resultWithImage: DeforestrationSateliteResponse[]
  ) {
    let farm;
    let farmUUID = uuid.v4();
    if (report.farmId) {
      farm = await this.farmService.findOne(+report.farmId);
    }

    const blockChainData: IBlockChainData = {
      AssessmentNumber: report.reportGuid,
      ModelVersion: report.modelVersion,
      ReportVersion: report.reportVersion,
      GeometryType: report.geometryType,
      IssueDate: report.issueDate || moment(report.createdAt).format('YYYY-MM-DD'),
      FarmerUUID: report.farmerUUID || uuid.v4(),
      FarmUUID: report.farmUUID ? report.farmUUID : !report.farmId ? farmUUID : farm.farmUUID || farmUUID,
      OverallDeforestationProbability: report.originalOverallProb || report.overallProb,
      HashAlgorithm: 'SHA-256',
      GeometryHash:
        report.reportType === ReportType.NONREGISTEREDFARM ? report.circularDataSHA256 : report.polygonalDataSHA256,
    };

    if (!report.farmerUUID || !report.farmUUID)
      await this.deforestationReportRequestModel.update(
        {
          farmUUID: blockChainData.FarmUUID,
          farmerUUID: blockChainData.FarmerUUID,
        },
        { where: { id: report.id } }
      );

    try {
      const contract = await initializeEtherContract();

      const testString = JSON.stringify(blockChainData);
      const expectedHash = utils.keccak256(utils.toUtf8Bytes(testString));

      const gasFeeData = await getFeeData();
      // Example: Call a write function on the contract
      const transactionParameters = {
        // gasLimit: gasFeeData.gasLimit,
        gasPrice: gasFeeData.gasPrice, // Specify the gas price (in gwei)
      };
      //Send string to smart contract function expecting hash
      const transaction = await contract.mapSerializedReportData(testString, transactionParameters);

      await this.deforestationReportRequestModel.update(
        {
          transactionHash: transaction.hash,
          keccakHash: expectedHash,
          isCertificateReady: true,
          status: ReportStatus.CERTIFICATE_READY,
        },
        { where: { id: report.id } }
      );
      return true;
    } catch (err) {
      await this.deforestationReportRequestModel.update(
        {
          isCertificateReady: report.isCertificateReady,
          isCertified: report.isCertified,
          status: report.status,
        },
        { where: { id: report.id } }
      );
      console.log(err);
      throw new Error('Error writing data to blockchain.');
    }
  }

  // get signed url of the file REgion west
  getSignedURLs3West = async (action = 'getObject', params) => {
    try {
      var url = this.s3Service.s3.getSignedUrl(action, params);
      return url;
    } catch (err) {
      console.log('inside verify has function ********', err.message);
    }
  };

  getDeforestationReportSateliteData(requestId: number | null, image2020S3Key: string, finalResultS3Key: string) {
    //Python result response

    const reportData = [];

    // const ImageFetchUrl = URL.BASEURL + URL.FETCH_IMAGE;

    const images = [
      {
        reportType: 'Image 2020',
        imageKey: image2020S3Key,
        imageHash: utils.keccak256(utils.toUtf8Bytes(image2020S3Key)),
        ordering: 1,
      },
      {
        reportType: 'Deforestation',
        imageKey: finalResultS3Key,
        imageHash: utils.keccak256(utils.toUtf8Bytes(finalResultS3Key)),
        ordering: 2,
      },
    ];

    for (let i = 0; i < images.length; i++) {
      const element = images[i];

      reportData.push({
        reportName: element.reportType,
        reportRequestId: requestId ?? undefined,
        satelliteSource: 'Santinel',
        imageName: `Deforestation-${requestId}-${element.imageKey}`,
        imagePath: element.imageKey,
        imgS3Key: element.imageKey,
        ordering: element.ordering,
        imageHash: element.imageHash,
      });
    }

    return reportData;
  }

  async findAllProb(getDeforestationInput: GetCertificateInputAdmin & { lang?: string }) {
    let { organization, lang = 'en' } = getDeforestationInput;

    const countRes = await this.sequelize.query(
      `
      SELECT 
        ${CONSTANT.DEFORESTATION_STATUS_CONFIG.reduce((prev, current) => {
          if (prev.length) prev += ',';
          prev += `COUNT(CASE WHEN overallProb LIKE '${current.label.split('/')[0]}%' THEN 1 END) AS ${camelCase(
            current.label.replace('/', ' Or ')
          )}`;

          return prev;
        }, '')}
      FROM 
        deforestation_report_requests as drr
      WHERE
        drr.orgId = :organization
        AND drr.isCertified = true
        AND drr.status in ('CERTIFICATE_READY')
        AND drr.is_deleted = 0;
      `,
      {
        replacements: { organization },
        plain: true,
      }
    );

    const colorRes = await this.sequelize.query(
      `
        SELECT ${CONSTANT.DEFORESTATION_STATUS_CONFIG.reduce((prev, current) => {
          if (prev.length) prev += ',';
          prev += `${camelCase(current.label.split('/')[0])}ProbColor`;
          return prev;
        }, '')}
        FROM deforestation_report_requests
        WHERE is_deleted = 0 AND overallProb IS NOT NULL
        ORDER BY id DESC
        LIMIT 1;
      `,
      {
        plain: true,
      }
    );
    const totalCount = Object.values(countRes).reduce((sum: number, count: number) => sum + count, 0) as number;
    const data: AverageProb[] = CONSTANT.DEFORESTATION_STATUS_CONFIG.map((config) => {
      const labelTranslation = this.i18n.translate(`message.${snakeCase(config.label.replace('/', ' Or '))}`, {
        lang: lang || 'en',
        defaultValue: config.label,
      });
      const count = countRes[camelCase(config.label.replace('/', ' Or '))] as number | undefined;
      const color: string = colorRes[`${camelCase(config.label.split('/')[0])}ProbColor`] as string | undefined;
      return {
        type: config.label,
        label: labelTranslation,
        percent: count && count > 0 ? (count * 100) / totalCount : 0,
        colorCode: color || config.colorCode,
      };
    });
    return data;
  }

  async findAllForAdmin(getDeforestationInput: GetCertificateInputAdmin & { lang: string }) {
    let {
      search,
      page = 1,
      limit = 10,
      country,
      state,
      farmId,
      status,
      organization,
      isCertified = false,
      adminReportType = 'certification',
      lang,
    } = getDeforestationInput;

    const query = { offset: 1, limit: 10 };
    let where: any = {
      orgId: organization,
      isDeleted: 0,
    };

    if (adminReportType == AdminDisplayType.CERTIFICATION) {
      where = {
        ...where,
        isCertified: isCertified,
        status: {
          [Op.in]: [ReportStatus.CERTIFIED, ReportStatus.CERTIFICATE_READY],
        },
      };
    } else {
      where = {
        ...where,
        isCertified: {
          [Op.in]: [true, false],
        },
        status: {
          [Op.in]: [ReportStatus.REQUESTED, ReportStatus.CERTIFICATE_READY, ReportStatus.CERTIFIED],
        },
      };
    }

    if (page && limit) {
      limit = limit;
      query.offset = (page - 1) * limit;
      query.limit = limit;
    }

    if (search) {
      where = {
        ...where,
        [Op.or]: [
          {
            farmName: { [Op.like]: `%${search}%` },
          },
          {
            farmerName: { [Op.like]: `%${search}%` },
          },
          {
            geofence_area: { [Op.like]: `%${search}%` },
          },
          {
            locationName: { [Op.like]: `%${search}%` },
          },
          {
            country: { [Op.like]: `%${search}%` },
          },
          {
            state: { [Op.like]: `%${search}%` },
          },
        ],
      };
    }
    if (farmId) {
      where = {
        ...where,
        farmId: farmId,
      };
    }

    if (status) {
      where = {
        ...where,
        status: status,
      };
    }

    if (country) {
      where = {
        ...where,
        country: country,
      };
    }

    if (state) {
      where = {
        ...where,
        state: state,
      };
    }

    let res: { totalCount?: any; count: any; rows: any };
    res = await this.deforestationReportRequestModel.findAndCountAll({
      where: where,
      order: [['id', 'DESC']],
      include: [
        {
          model: Farm,
          as: 'farm',
        },
        {
          model: ReportRequestCoordinates,
          as: 'coordinates',
        },
        {
          model: DeforestrationSateliteResponse,
          as: 'sateliteResponse',
          order: [['ordering', 'ASC']],
        },
      ],
      ...query,
      group: ['id'],
      distinct: true,
    });
    for (let i = 0; i < res.rows.length; i++) {
      const element = res.rows[i];
      element.zoneName = element.zoneName || 'All Farm';
      element.geofenceArea = parseFloat(element.geofenceArea).toFixed(2);
      element.deforestationPercent = parseFloat(element.deforestationPercent).toFixed(2);
      element.deforestationArea = parseFloat(element.deforestationArea).toFixed(2);
      element.treeGainPercent = parseFloat(element.treeGainPercent).toFixed(2);
      element.treeGainArea = parseFloat(element.treeGainArea).toFixed(2);
      element.forestArea2020 = parseFloat(element.forestArea2020).toFixed(2);
      element.forestArea2020Percent = parseFloat(element.forestArea2020Percent).toFixed(2);
      element.forestArea2022 = parseFloat(element.forestArea2022).toFixed(2);
      element.forestArea2022Percent = parseFloat(element.forestArea2022Percent).toFixed(2);
      const sateliteResponse = element.sateliteResponse;
      for (let index = 0; index < sateliteResponse.length; index++) {
        const element = sateliteResponse[index];
        const params = {
          Bucket: process.env.DEFORESTATION_BUCKET || 'dimitra-deforestation-result-images',
          Key: element.imagePath,
          Expires: 60 * 60,
        };

        let urlRes = await this.getSignedURLs3West('getObject', params);
        element.imagePath = urlRes;
      }

      if (element.transactionHash) {
        element.storedInBlockchain = true;
        const link = `${process.env.ETHER_SCAN}/${element.transactionHash}`;
        element.etherScanLink = link;
        element.qrCode = await toDataURL(link);
      }
    }
    res.totalCount = res.count.length;
    res.count = res.rows.length;

    if (lang && lang !== 'en') {
      res.rows = res.rows.map((row) => {
        row = row.toJSON();
        row.metrics.forEach((metric) => {
          const labelTranslation = this.i18n.translate(`message.${snakeCase(metric.label.replace('/', ' Or '))}`, {
            lang,
            defaultValue: metric.label,
          });
          metric.label = labelTranslation;
          metric.colorName = this.i18n.translate(`message.${snakeCase(metric.colorName)}`, {
            lang,
            defaultValue: metric.colorName,
          });
          metric.description = this.i18n.translate('message.status_note', {
            lang,
            args: { status: labelTranslation.toLowerCase() },
          });
        });
        return row;
      });
    }

    return res;
  }

  async findAll(
    userId: number,
    getDeforestationInput: GetCertificateInput | GetDeforestationInput,
    isCertificateReady = false,
    isReportRequested = false,
    lang = 'en'
  ) {
    let { search, page = 1, limit = 10, country, state, farmId, status, isCertified } = getDeforestationInput;

    const query = { offset: 1, limit: 10 };
    let where: any = {
      userId: userId,
      isDeleted: 0,
      isCertified: false,
    };

    if (page && limit) {
      limit = limit;
      query.offset = (page - 1) * limit;
      query.limit = limit;
    }

    if (search) {
      where = {
        ...where,
        [Op.or]: [
          {
            locationName: { [Op.like]: `%${search}%` },
          },
          {
            country: { [Op.like]: `%${search}%` },
          },
          {
            state: { [Op.like]: `%${search}%` },
          },
        ],
      };
    }
    if (farmId) {
      where = {
        ...where,
        farmId: farmId,
      };
    }

    if (status) {
      where = {
        ...where,
        status: status,
      };
    }

    if (country) {
      where = {
        ...where,
        country: country,
      };
    }

    if (isReportRequested) {
      where = {
        ...where,
        state: ReportStatus.REQUESTED,
      };
    } else if (state) {
      where = {
        ...where,
        state: state,
      };
    }
    if (isCertified) {
      where = {
        ...where,
        isCertified: isCertified,
        status: {
          [Op.in]: [ReportStatus.CERTIFIED, ReportStatus.CERTIFICATE_READY],
        },
      };
    } else if (isCertified === null) {
      // fetch both certified and uncertified if null
      delete where.isCertified;
      where = {
        ...where,
      };
    }
    if (isCertificateReady) {
      where = {
        ...where,
        isCertified: true,
        status: ReportStatus.CERTIFICATE_READY,
        isCertificateReady: true,
      };
    }

    let res: { totalCount?: any; count: any; rows: any };

    res = await this.deforestationReportRequestModel.findAndCountAll({
      where: where,
      order: [['id', 'DESC']],
      include: [
        {
          model: Farm,
          as: 'farm',
        },
        {
          model: ReportRequestCoordinates,
          as: 'coordinates',
        },
        {
          model: DeforestrationSateliteResponse,
          as: 'sateliteResponse',
          order: [['ordering', 'ASC']],
        },
      ],
      ...query,
      group: ['id'],
      distinct: true,
    });
    for (let i = 0; i < res.rows.length; i++) {
      const element = res.rows[i];
      element.zoneName = element.zoneName || 'All Farm';
      element.geofenceArea = parseFloat(element.geofenceArea).toFixed(2);
      // element.deforestationPercent = parseFloat(
      //   element.deforestationPercent
      // ).toFixed(2);
      // element.deforestationArea = parseFloat(element.deforestationArea).toFixed(
      //   2
      // );
      // element.treeGainPercent = parseFloat(element.treeGainPercent).toFixed(2);
      // element.treeGainArea = parseFloat(element.treeGainArea).toFixed(2);
      // element.forestArea2020 = parseFloat(element.forestArea2020).toFixed(2);
      // element.forestArea2020Percent = parseFloat(
      //   element.forestArea2020Percent
      // ).toFixed(2);
      // element.forestArea2022 = parseFloat(element.forestArea2022).toFixed(2);
      // element.forestArea2022Percent = parseFloat(
      //   element.forestArea2022Percent
      // ).toFixed(2);
      const sateliteResponse = element.sateliteResponse;
      for (let index = 0; index < sateliteResponse.length; index++) {
        const element = sateliteResponse[index];
        const params = {
          Bucket: process.env.DEFORESTATION_BUCKET || 'dimitra-deforestation-result-images',
          Key: element.imagePath,
          Expires: 60 * 60,
        };

        let urlRes = await this.getSignedURLs3West('getObject', params);
        element.imagePath = urlRes;
      }

      if (element.transactionHash) {
        element.storedInBlockchain = true;
        const link = `${process.env.ETHER_SCAN}/${element.transactionHash}`;
        element.etherScanLink = link;
        element.qrCode = await toDataURL(link);
      }
    }
    res.totalCount = res.count.length;
    res.count = res.rows.length;

    if (lang && lang !== 'en') {
      res.rows = res.rows.map((row) => {
        row = row.toJSON();
        row.metrics.forEach((metric) => {
          const labelTranslation = this.i18n.translate(`message.${snakeCase(metric.label.replace('/', ' Or '))}`, {
            lang,
            defaultValue: metric.label,
          });
          metric.label = labelTranslation;
          metric.colorName = this.i18n.translate(`message.${snakeCase(metric.colorName)}`, {
            lang,
            defaultValue: metric.colorName,
          });
          metric.description = this.i18n.translate('message.status_note', {
            lang,
            args: { status: labelTranslation.toLowerCase() },
          });
        });
        return row;
      });
    }

    return res;
  }

  async findAllByUserId(
    userId: number,
    getDeforestationInput: GetCertificateInput | GetDeforestationInput,
    isCertificateReady = false,
    isReportRequested = false,
    lang = 'en'
  ) {
    let { search, country, state, farmId, status, isCertified } = getDeforestationInput;

    let where: any = {
      userId: userId,
      isDeleted: 0,
      isCertified: false,
    };

    if (search) {
      where = {
        ...where,
        [Op.or]: [
          {
            locationName: { [Op.like]: `%${search}%` },
          },
          {
            country: { [Op.like]: `%${search}%` },
          },
          {
            state: { [Op.like]: `%${search}%` },
          },
        ],
      };
    }
    if (farmId) {
      where = {
        ...where,
        farmId: farmId,
      };
    }

    if (status) {
      where = {
        ...where,
        status: status,
      };
    }

    if (country) {
      where = {
        ...where,
        country: country,
      };
    }

    if (isReportRequested) {
      where = {
        ...where,
        state: ReportStatus.REQUESTED,
      };
    } else if (state) {
      where = {
        ...where,
        state: state,
      };
    }
    if (isCertified) {
      where = {
        ...where,
        isCertified: isCertified,
        status: {
          [Op.in]: [ReportStatus.CERTIFIED, ReportStatus.CERTIFICATE_READY],
        },
      };
    } else if (isCertified === null) {
      // fetch both certified and uncertified if null
      delete where.isCertified;
      where = {
        ...where,
      };
    }
    if (isCertificateReady) {
      where = {
        ...where,
        isCertified: true,
        status: ReportStatus.CERTIFICATE_READY,
        isCertificateReady: true,
      };
    }

    let res: { totalCount?: any; count: any; rows: any };

    res = await this.deforestationReportRequestModel.findAndCountAll({
      where: where,
      order: [['id', 'DESC']],
      include: [
        {
          model: Farm,
          as: 'farm',
        },
        {
          model: ReportRequestCoordinates,
          as: 'coordinates',
        },
        {
          model: DeforestrationSateliteResponse,
          as: 'sateliteResponse',
          order: [['ordering', 'ASC']],
        },
      ],
      group: ['id'],
      distinct: true,
    });
    for (let i = 0; i < res.rows.length; i++) {
      const element = res.rows[i];
      element.zoneName = element.zoneName || 'All Farm';
      element.geofenceArea = parseFloat(element.geofenceArea).toFixed(2);
      element.deforestationPercent = parseFloat(element.deforestationPercent).toFixed(2);
      element.deforestationArea = parseFloat(element.deforestationArea).toFixed(2);
      element.treeGainPercent = parseFloat(element.treeGainPercent).toFixed(2);
      element.treeGainArea = parseFloat(element.treeGainArea).toFixed(2);
      element.forestArea2020 = parseFloat(element.forestArea2020).toFixed(2);
      element.forestArea2020Percent = parseFloat(element.forestArea2020Percent).toFixed(2);
      element.forestArea2022 = parseFloat(element.forestArea2022).toFixed(2);
      element.forestArea2022Percent = parseFloat(element.forestArea2022Percent).toFixed(2);
      const sateliteResponse = element.sateliteResponse;
      for (let index = 0; index < sateliteResponse.length; index++) {
        const element = sateliteResponse[index];
        const params = {
          Bucket: process.env.DEFORESTATION_BUCKET || 'dimitra-deforestation-result-images',
          Key: element.imagePath,
          Expires: 60 * 60,
        };

        let urlRes = await this.getSignedURLs3West('getObject', params);
        element.imagePath = urlRes;
      }

      if (element.transactionHash) {
        element.storedInBlockchain = true;
        const link = `${process.env.ETHER_SCAN}/${element.transactionHash}`;
        element.etherScanLink = link;
        element.qrCode = await toDataURL(link);
      }
    }
    res.totalCount = res.count.length;
    res.count = res.rows.length;

    if (lang && lang !== 'en') {
      res.rows = res.rows.map((row) => {
        row = row.toJSON();
        row.metrics.forEach((metric) => {
          const labelTranslation = this.i18n.translate(`message.${snakeCase(metric.label.replace('/', ' Or '))}`, {
            lang,
            defaultValue: metric.label,
          });
          metric.label = labelTranslation;
          metric.colorName = this.i18n.translate(`message.${snakeCase(metric.colorName)}`, {
            lang,
            defaultValue: metric.colorName,
          });
          metric.description = this.i18n.translate('message.status_note', {
            lang,
            args: { status: labelTranslation.toLowerCase() },
          });
        });
        return row;
      });
    }

    return res;
  }

  async findOne(id: number, userUnit?: UserUnitInput, lang = 'en') {
    let report = await this.deforestationReportRequestModel.findOne({
      where: { id: id },
      include: [
        {
          model: Farm,
          as: 'farm',
          include:[
            {
              model:UserDDS,
              as:'userDdsAssoc'
            }
          ]
        },
        {
          model: ReportRequestCoordinates,

          as: 'coordinates',
        },
        {
          model: DeforestrationSateliteResponse,
          as: 'sateliteResponse',
        },
      ],
      order: [['sateliteResponse', 'ordering', 'asc']],
    });
    if (!report) throw new HttpException(`Report doesn't exists`, 400);
    report.zoneName = report.zoneName || 'All Farm';

    report.geofenceArea = report.geofenceArea ? this.convertToUserUnit(report.geofenceArea, userUnit?.factor) : 0;
    // report.deforestationPercent = parseFloat(
    //   parseFloat(report.deforestationPercent.toString()).toFixed(2)
    // );
    // report.deforestationArea = this.convertToUserUnit(
    //   report.deforestationArea,
    //   userUnit?.factor
    // );

    // report.treeGainPercent = parseFloat(
    //   parseFloat(report.treeGainPercent.toString()).toFixed(2)
    // );
    // report.treeGainArea = this.convertToUserUnit(
    //   report.treeGainArea,
    //   userUnit?.factor
    // );
    // report.forestArea2020 = this.convertToUserUnit(
    //   report.forestArea2020,
    //   userUnit?.factor
    // );
    // report.forestArea2020Percent = parseFloat(
    //   parseFloat(report.forestArea2020Percent.toString()).toFixed(2)
    // );
    // report.forestArea2022 = this.convertToUserUnit(
    //   report.forestArea2022,
    //   userUnit?.factor
    // );
    // report.forestArea2022Percent = parseFloat(
    //   parseFloat(report.forestArea2022Percent.toString()).toFixed(2)
    // );

    const sateliteResponse = report.sateliteResponse;
    for (let index = 0; index < sateliteResponse.length; index++) {
      const element = sateliteResponse[index];
      const params = {
        Bucket: process.env.DEFORESTATION_BUCKET || 'dimitra-deforestation-result-images',
        Key: element.imagePath,
        Expires: 60 * 60,
      };

      let urlRes = await this.getSignedURLs3West('getObject', params);
      element.imagePath = urlRes;
    }

    if (report.transactionHash) {
      report.storedInBlockchain = true;
      const link = `${process.env.ETHER_SCAN}/${report.transactionHash}`;
      report.etherScanLink = link;
      report.qrCode = await toDataURL(link);
    }

    let reportJSON: any;

    if (lang && lang !== 'en') {
      reportJSON = {
        ...report.toJSON(),
        etherScanLink: report.etherScanLink,
        qrCode: report.qrCode
      };

      reportJSON.metrics.forEach((metric) => {
        const labelTranslation = this.i18n.translate(`message.${snakeCase(metric.label.replace('/', ' Or '))}`, {
          lang,
          defaultValue: metric.label,
        });
        metric.label = labelTranslation;
        metric.colorName = this.i18n.translate(`message.${snakeCase(metric.colorName)}`, {
          lang,
          defaultValue: metric.colorName,
        });
        metric.description = this.i18n.translate('message.status_note', {
          lang,
          args: { status: labelTranslation.toLowerCase() },
        });
      });
    }
    else{
      reportJSON  = report;
    }
   
    return reportJSON;
  }

  async getImageLinkFromHash(imageHash: string) {
    const report = await this.deforestationSateliteResponseModel.findOne({
      where: { imageHash },
    });
    if (!report) throw new HttpException(`Image doesn't exists`, 400);
    const imageKey = report.imgS3Key;
    const paramImage = {
      Bucket: process.env.DEFORESTATION_BUCKET || 'dimitra-deforestation-result-images',
      Key: imageKey,
    };
    const { Body } = await this.s3Service.s3.getObject(paramImage).promise();
    return `data:image/png;base64,${Body.toString('base64')}`;
  }

  async requestComplianceCertificate(reportId: number, userId: number, lang: string) {
    try {
      const reportDetail = await this.deforestationReportRequestModel.findOne({
        where: { id: reportId, userId: userId, is_deleted: 0, isCertified: 0 },
        order: [['created_at', 'DESC']],
        include: [
          {
            model: Farm,
            attributes: ['farmName', 'farmOwner'],
            as: 'farm',
          },
        ],
      });

      if (!reportDetail)
        throw new BadRequestException(this.i18n.translate('message.deforestation.reportNotFound', { lang }));

      await this.deforestationReportRequestModel.update(
        { isCertified: true, status: ReportStatus.CERTIFIED },
        { where: { id: reportId } }
      );

      const coordinates = await this.coordinatesModel.findAll({
        attributes: ['latitude', 'longitude'],
        where: {
          reportRequestId: reportId,
        },
      });
      const resultWithImage = await this.deforestationSateliteResponseModel.findAll({
        attributes: [
          'reportName',
          'reportRequestId',
          'satelliteSource',
          'imageName',
          'imagePath',
          'imgS3Key',
          'ordering',
          'imageHash',
        ],
        where: { reportRequestId: reportId },
        order: [['ordering', 'asc']],
      });

      await this.writeToBlockChain(reportDetail, coordinates, resultWithImage);
      return 'Compliance certificate is in process';
    } catch (err) {
      throw new HttpException(
        err.message || this.i18n.translate('message.deforestation.complianceRequestError', { lang }),
        err.status || 500
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} deforestation`;
  }

  async createUserAndFarm(createDeforestationInput, userId, t, reportType, lang) {
    let userExists = null,
      farmExists = null,
      orgExists = null;
    if (createDeforestationInput.OrgObj) {
      //  backward compatibility changes
      orgExists = await this.OrgModel.findOne({
        where: {
          id: createDeforestationInput.OrgObj.id,
        },
      });
    }
    userExists = await this.userModel.findOne({
      where: {
        id: userId,
      },
    });
    if (reportType === 'REGISTERED_FARM') {
      farmExists = await this.farmModel.findOne({
        where: {
          id: createDeforestationInput.FarmObj.id,
        },
      });
    }

    if (!orgExists && createDeforestationInput.OrgObj) {
      //  backward compatibility changes
      await this.OrgModel.create({ ...createDeforestationInput.OrgObj });
    }
    if (!userExists) {
      delete createDeforestationInput.UserObj.createdAt;
      delete createDeforestationInput.UserObj.updatedAt;
      await this.userModel.create({ ...createDeforestationInput.UserObj, id: userId });
    }
    if (!farmExists && reportType === 'REGISTERED_FARM') {
      let createFarmInputFinal = {
        ...createDeforestationInput.FarmObj,
        area: createDeforestationInput.FarmObj.area === '' ? 0 : createDeforestationInput.FarmObj.area,
        // productionSystem: JSON.stringify(createDeforestationInput.FarmObj.productionSystem),
      };
      let createRes = await this.farmModel.upsert({ ...createFarmInputFinal, userId }, { transaction: t });
      let farmGeofence = createDeforestationInput.FarmObj.FarmCoordinates;
      let farmId = createFarmInputFinal.id;

      if (farmGeofence && farmGeofence.length > 0) {
        const farmCoordinates = farmGeofence.map((data) => {
          const { lat, log } = data;
          return {
            farmId,
            userId,
            lat,
            log,
          };
        });
        // insert data into the user farm coordinates
        await this.FarmCoordinatesModelModel.bulkCreate(farmCoordinates, {
          transaction: t,
        });
      }

      // for(const segmentEl of   createDeforestationInput.GeoFences){
      //   let geoObj = {
      //     "geofenceName": segmentEl.geofenceName,
      //     "geofenceArea": segmentEl.geofenceArea,
      //     "geofenceParameter": segmentEl.geofenceParameter,
      //     "farmId": createDeforestationInput.id,
      //     "userId": userId,
      //   }
      //  let geofenceRes   =  await this.GeofenceModel.create(geoObj, {transaction: t})

      //  for(const segCoordEl of   segmentEl.geofenceCoordinates){

      //               let segmentCoordObj = {
      //                 "lat": segCoordEl.lat,
      //                 "log": segCoordEl.log,
      //                 "geofenceId": geofenceRes.id,
      //               }
      //               await this.GeofenceCoordinatesModel.create(segmentCoordObj, {transaction: t})
      //             }

      // }

      //promisify synchronous for loop
      await new Promise(async (resolve, reject) => {
        try {
          for (const segmentEl of createDeforestationInput.FarmObj.GeoFences) {
            let geoObj = {
              geofenceName: segmentEl.geofenceName,
              geofenceArea: segmentEl.geofenceArea,
              geofenceParameter: segmentEl.geofenceParameter,
              farmId: createDeforestationInput.farmId,
              userId: userId,
            };

            let geofenceRes = await this.GeofenceModel.create(geoObj, {
              transaction: t,
            });

            for (const segCoordEl of segmentEl.geofenceCoordinates) {
              let segmentCoordObj = {
                lat: segCoordEl.lat,
                log: segCoordEl.log,
                geofenceId: geofenceRes.id,
              };
              await this.GeofenceCoordinatesModel.create(segmentCoordObj, {
                transaction: t,
              });
            }
          }
          resolve(this.i18n.translate('message.deforestation.geofenceCreatedSuccessfully', { lang }));
        } catch (error) {
          console.error('Error creating geofences and coordinates:', error);
          reject(error);
        }
      });
    }
  }

  convertToUserUnit(valueInAcre: number, factor: number) {
    const parsedValue = parseFloat(parseFloat(valueInAcre.toString()).toFixed(2));

    if (!factor) return parsedValue;
    return parsedValue / factor;
  }

  async deforestationByFarmId(farmId: number, lang = 'en') {
    try {
      let deforestation = await this.deforestationReportRequestModel.findOne({
        where: {
          farmId,
          isDeleted: false,
        },
        include: [
          {
            model: Farm,
            as: 'farm',
            include:[
             {
               model:UserDDS,
               as:'userDdsAssoc'
             }
            ]
          },
          {
            model: ReportRequestCoordinates,
            as: 'coordinates',
          },
          {
            model: DeforestrationSateliteResponse,
            as: 'sateliteResponse',
            order: [['ordering', 'ASC']],
          },
        ],
        order: [['id', 'DESC']],
        limit: 1,
      });

      const sateliteResponse = deforestation?.sateliteResponse;
      if (sateliteResponse) {
        for (let index = 0; index < sateliteResponse.length; index++) {
          const element = sateliteResponse[index];
          const params = {
            Bucket: process.env.DEFORESTATION_BUCKET || 'dimitra-deforestation-result-images',
            Key: element.imagePath,
            Expires: 60 * 60,
          };

          let urlRes = await this.getSignedURLs3West('getObject', params);
          element.imagePath = urlRes;
        }
      }
      if (lang && lang !== 'en') {
        deforestation = deforestation.toJSON();
        deforestation.metrics.forEach((metric) => {
          const labelTranslation = this.i18n.translate(`message.${snakeCase(metric.label.replace('/', ' Or '))}`, {
            lang,
            defaultValue: metric.label,
          });
          metric.label = labelTranslation;
          metric.colorName = this.i18n.translate(`message.${snakeCase(metric.colorName)}`, {
            lang,
            defaultValue: metric.colorName,
          });
          metric.description = this.i18n.translate('message.status_note', {
            lang,
            args: { status: labelTranslation.toLowerCase() },
          });
        });
      }
      return deforestation;
    } catch (err) {
      console.error('Error getting deforestation data by farm ID.', err);
      throw new HttpException(err.message || 'Error getting deforestation data by farm ID', err.status || 500);
    }
  }

  // async testBC() {
  //   try {
  //     const contract = await initializeEtherContract();

  //     const testString = JSON.stringify("hi this is test ");
  //     const expectedHash = utils.keccak256(utils.toUtf8Bytes(testString));

  //     //Send string to smart contract function expecting hash
  //     const transaction = await contract.mapSerializedReportData(testString);
  //     const bal = await getBalance(
  //       "0xedB54937dE95561FD6f34C1B6c3e4085F7a583D6"
  //     );
  //     // return bal;
  //     return transaction.hash;
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  async getBulkDeforestation(pythonReqObj) {
    try {
      const endpoint = URL.BASEURL + URL.DETECT_DEFORESATION_BULK;
      let response = await this.apiCallHelper.call<{ data: [IPythonResponse] }>(
        RequestMethod.POST,
        endpoint,
        {
          'Auth-Token': CONSTANT.DEFORESTATION_API_KEY,
        },
        pythonReqObj
      );
      const veryHighProbConfig = CONSTANT.DEFORESTATION_STATUS_CONFIG.find((config) => config.label === 'Very High');
      const highProbConfig = CONSTANT.DEFORESTATION_STATUS_CONFIG.find((config) => config.label === 'High');
      const mediumProbConfig = CONSTANT.DEFORESTATION_STATUS_CONFIG.find((config) => config.label === 'Medium');
      const lowProbConfig = CONSTANT.DEFORESTATION_STATUS_CONFIG.find((config) => config.label === 'Low');
      const veryLowProbConfig = CONSTANT.DEFORESTATION_STATUS_CONFIG.find((config) => config.label === 'Very Low');
      const zeroProbConfig = CONSTANT.DEFORESTATION_STATUS_CONFIG.find((config) => config.label === 'Zero');
      for (let i = 0; i < response?.data?.data?.length; i++) {
        const element = response.data.data[i];
        if (element.result) {
          const reqObj = pythonReqObj.items.find((item) => item.aoiId === element.aoiId);
          const farmDetail = await this.farmModel.findOne({
            where: {
              id: element.aoiId,
            },
          });
          if (farmDetail) {
            await this.deforestationReportRequestModel.update(
              {
                isDeleted: true,
              },
              {
                where: { farmId: farmDetail.id },
              }
            );
            const savedDeforestationReportData = await this.deforestationReportRequestModel.create({
              reportGuid: uuid.v4(),
              userId: reqObj.userId,
              farmId: element.aoiId,
              farmName: farmDetail.farmName,
              locationName: farmDetail.address,
              farmerUUID: uuid.v4(),
              farmUUID: uuid.v4(),
              country: element.result.country ? element.result.country.name : farmDetail.country,
              state: farmDetail.state,
              centerLatitude: reqObj.lat || reqObj.latitude,
              centerLongitude: reqObj.lng || reqObj.longitude,
              geometryType: element.geometryType,
              issueDate: element.issueDate,
              circularDataSHA256: element.circularDataSHA256,
              polygonalDataSHA256: element.polygonalDataSHA256,
              modelVersion: element.modelVersion,
              reportVersion: element.reportVersion,
              radius: reqObj.radius && !isNaN(Number(reqObj.radius)) ? reqObj.radius * 1000 : null, // Python request object is in km, convert to meter
              title: element.title,
              highProb: element.result.highProb * 2.471, // convert to acre since we get in hectare from python, acre is default unit for us
              highProbPercent: element.result.highProbPercent,
              highProbColor: element.result.highProbColor || highProbConfig.colorCode,
              highProbColorName: element.result.highProbColorName || highProbConfig.colorName,
              lowProb: element.result.lowProb * 2.471, // convert to acre since we get in hectare from python, acre is default unit for us
              lowProbPercent: element.result.lowProbPercent,
              lowProbColor: element.result.lowProbColor || lowProbConfig.colorCode,
              lowProbColorName: element.result.lowProbColorName || lowProbConfig.colorName,
              totalArea: element.result.totalArea * 2.471, // convert to acre since we get in hectare from python, acre is default unit for us
              zeroProb: element.result.zeroProb * 2.471, // convert to acre since we get in hectare from python, acre is default unit for us
              zeroProbPercent: element.result.zeroProbPercent,
              zeroProbColor: element.result.zeroProbColor || zeroProbConfig.colorCode,
              zeroProbColorName: element.result.zeroProbColorName || zeroProbConfig.colorName,
              overallProb: element.result.overallProb,
              mediumProb: element.result.mediumProb * 2.471, // convert to acre since we get in hectare from python, acre is default unit for us,
              mediumProbPercent: element.result.mediumProbPercent,
              mediumProbColor: element.result.mediumProbColor || mediumProbConfig.colorCode,
              mediumProbColorName: element.result.mediumProbColorName || mediumProbConfig.colorName,
              veryHighProb: element.result.veryHighProb * 2.471, // convert to acre since we get in hectare from python, acre is default unit for us,
              veryHighProbPercent: element.result.veryHighProbPercent,
              veryHighProbColor: element.result.veryHighProbColor || veryHighProbConfig.colorCode,
              veryHighProbColorName: element.result.veryHighProbColorName || veryHighProbConfig.colorName,
              veryLowProb: element.result.veryLowProb * 2.471, // convert to acre since we get in hectare from python, acre is default unit for us,
              veryLowProbPercent: element.result.veryLowProbPercent,
              veryLowProbColor: element.result.veryLowProbColor || veryLowProbConfig.colorCode,
              veryLowProbColorName: element.result.veryLowProbColorName || veryLowProbConfig.colorName,
            });

            const reportCoordinates =
              reqObj?.coordinates?.map((data) => {
                const { latitude, longitude } = data;
                return {
                  reportRequestId: savedDeforestationReportData.id,
                  latitude: latitude,
                  longitude: longitude,
                };
              }) || [];

            // insert data into the report coordinates
            await this.coordinatesModel.bulkCreate(reportCoordinates, {});

            const resultWithImage = await this.getDeforestationReportSateliteData(
              savedDeforestationReportData.id,
              element.result.allProbImageS3Key,
              element.result.finalDetectionS3Key
            );
            await this.deforestationSateliteResponseModel.bulkCreate(resultWithImage);
            if(!savedDeforestationReportData.errorStatus) {
              await this.writeDeforestationDataToSolana({
                transactableId: savedDeforestationReportData.id,
                farm: savedDeforestationReportData.farmUUID,
                indigenousArea: element.result?.indigenousLand?.length ? element.result.indigenousLand[0] : 'No',
                protectedArea: element.result?.protectedAreasAlerts?.length ? element.result.protectedAreasAlerts[0] : 'No',
                deforestationStatus: savedDeforestationReportData.originalOverallProb || savedDeforestationReportData.overallProb,
                reportVersion: savedDeforestationReportData.reportVersion,
                country: savedDeforestationReportData.country,
              });
            }
          }
        }
      }
      return response;
    } catch (err) {
      console.error('Error getting deforestation data by farm ID.', err);
      throw new HttpException(err.message || 'Error getting deforestation data by farm ID', err.status || 500);
    }
  }

  truncateToSixDecimalPoint(num){
    return Math.floor(num * 1e6) / 1e6
  }
  getTruncatedCoordinates(coordinates: FarmCoordinates[]):Array<{
    latitude: number;
    longitude: number;
  }>{

    const uniqueCoordinates = new Set();
      const polygonCoordinates:Array<{
        latitude: number;
        longitude: number;
      }> = [];

      // Format the coordinates for polygon farms
      coordinates.forEach((item) => {
        const latitude = this.truncateToSixDecimalPoint(item.lat);
        const longitude = this.truncateToSixDecimalPoint(item.log);
        const coordString = `${latitude},${longitude}`; // Convert coordinate pair to string for comparison
        if (!uniqueCoordinates.has(coordString)) {
          uniqueCoordinates.add(coordString); // Add to set if not already present
          polygonCoordinates.push(
            {
              latitude, 
              longitude
            }); // Add to filtered array
        }
      });

   return polygonCoordinates;
  }

  async getBulkDeforestationByDiligenceId(id: number, lang = 'en', eudrSetting: EudrSetting) {

    const deforestationExpiryTime = eudrSetting?.dynamicExpiryTime || 6;
    const deforestationExpiryPeriod = (eudrSetting?.dynamicExpiryTimePeriod || 'days') as moment.DurationInputArg2 ;
    const productionPlaces = await this.ReportProductionPlaceModel.findAll({
      where: {
        removed: false,
        diligenceReportId: id,
      },
      attributes: ['id','isEdit','isVerified','dueDiligenceProductionPlaceId'],
      include: [
        {
          model: ProductionPlaceDeforestationInfo,
          required: false,
          attributes: ['deforestationStatusDate'],
        },
        {
          model:DueDiligenceProductionPlace,
          required:true,
          attributes:['id'],
          include:[
            {
              model:DueDiligenceProductionPlacesPyData,
              required:false,
              attributes:['id'],
            }
          ]
        },
        {
          model: Farm,
          as: 'farm',
          where: {
            isDeleted: 0,
          },
          attributes: ['id', 'lat', 'log', 'farmName', 'address'],
          required: true,
          include: [
            {
              model: UserDDS,
              as: 'userDdsAssoc',
              required: true,
              attributes: ['id'],
            },
          ],
        },
        {
          model: Geofence,
          required: true,
          attributes: ['id', 'isPrimary', 'geofenceRadius', 'geofenceCenterLat', 'geofenceCenterLog'],
          include: [
            {
              model: GeofenceCoordinates,
              required: false,
              as: 'geofenceCoordinates',
            }
          ]
        },
      ],
    });
    let filteredProductionPlaces = productionPlaces.filter((place) => {
      if (!place.productionPlaceDeforestationInfo) return true;
      if(!place?.productionPlace?.dueDiligenceProductionPlacesPyData) return true;
      return moment(place.productionPlaceDeforestationInfo.deforestationStatusDate)
        .add(deforestationExpiryTime, deforestationExpiryPeriod)
        .isBefore(new Date());
    });
    const payloadData = [];

    const hasIsEditTrue = productionPlaces.some((item) => item.isEdit);

    if(hasIsEditTrue) {
      await this.ReportProductionPlaceModel.update(
        { isVerified: false },
        {
          where: {
            id: productionPlaces.map(place => place.id),
          }
        }
      );
      const filteredProductionPlaceIds = productionPlaces
              .filter(place => place.isEdit)
              .map(place => place.id);
      await this.ReportProductionPlaceModel.update(
        { isEdit: false, isVerified: true },
        {
          where: {
            id: filteredProductionPlaceIds
          }
        }
      );
    }
    filteredProductionPlaces.forEach((item) => {
      const geofence = item.geofence;
      let payloadItem = {
        farmId: item.farm.id,
        productionPlaceId:item.dueDiligenceProductionPlaceId,
        userId: parseInt(item.farm.userDdsAssoc.id.toString()),
        aoiId: parseInt(geofence.id.toString()),
        latitude: null,
        longitude: null,
        coordinates: [],
        radius: null,
        farmName: item.farm.farmName,
        farmAddress: item.farm.address,
        isPrimary: geofence.isPrimary,
      };
      if (geofence.geofenceCoordinates.length) {
        payloadItem.coordinates = geofence.geofenceCoordinates.map((coord) => ({
          latitude: parseFloat(coord.lat),
          longitude: parseFloat(coord.log),
        }));
        payloadItem.latitude = payloadItem.coordinates[0]?.latitude;
        payloadItem.longitude = payloadItem.coordinates[0]?.longitude;
        delete payloadItem.radius;
      } else if (!isNaN(Number(geofence.geofenceRadius))) {
        payloadItem.radius = geofence.geofenceRadius / 1000;
        payloadItem.latitude = parseFloat(geofence.geofenceCenterLat);
        payloadItem.longitude = parseFloat(geofence.geofenceCenterLog);
        delete payloadItem.coordinates;
      }
      payloadData.push(payloadItem);
    });

    if(!payloadData.length){
      await this.processAndReCalculateTolleranne(id,eudrSetting)
      return { payloadData };
    } 

    const pythonReqObjItems = payloadData.map((item) => {
      const reqItem = { ...item };
      delete reqItem.farmName;
      delete reqItem.productionPlaceId,
      delete reqItem.farmAddress;
      delete reqItem.farmId;
      delete reqItem.isPrimary;
      return reqItem;
    });
    const response = await withRetry(() => axios.request({
      baseURL: URL.BASEURL,
      url: URL.DETECT_DEFORESTATION_MASS,
      method: 'POST',
      headers: {
        'Auth-Token': CONSTANT.DEFORESTATION_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      data: {
        items: pythonReqObjItems,
        lang,
        disableImages: false,
        disableProtectedAreasAlerts: false,
        disableIndigenousLand: false,
        enableHiResSatelliteImages: false,
        enableSatelliteImages:false
      },
    }));
    return { responseData: response.data, payloadData, };
  }

  async getBulkUploadRequestStatusById(requestId: string) {
    const response = await axios.get<{ success: boolean; data: Record<string, unknown> }>(
      URL.GET_DEFORESTATION_REQUEST_STATUS,
      {
        headers: {
          'Auth-Token': CONSTANT.DEFORESTATION_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        params: {
          requestId,
        },
        baseURL: URL.BASEURL,
      }
    );
    return response.data;
  }

  async updateEUDRBulkStatus(eudrDeforestationStatusInput: EUDRDeforestationStatusInput[]) {
    try {
      const currentDate = moment(new Date().toISOString()).format('YYYY-MM-DD')
      const updatePromises = eudrDeforestationStatusInput.map(async (item) => {
        const { farmId, eudr_deforestation_status } = item;
        await this.dueDiligenceProductionPlaceModel.update(
          { eudr_deforestation_status,
            deforestationStatusDate: currentDate
           },
          {
            where: {
              farmId: farmId,
            },
          }
        );
      });

      const results = await Promise.allSettled(updatePromises);

      const failedUpdates = results
        .filter((result) => result.status === 'rejected')
        .map((result: PromiseRejectedResult | PromiseFulfilledResult<any>) => {
          if (result.status === 'rejected') {
            return { success: false, error: result.reason };
          } else {
            return result.value;
          }
        });

      if (failedUpdates.length > 0) {
        return {
          success: true,
          message: `Update completed with some failures.`,
          failedUpdates,
        };
      }

      return {
        success: true,
        message: 'Successfully updated EUDR deforestation status.',
      };
    } catch (error) {
      console.error('Error updating EUDR deforestation status:', error);
      return {
        success: false,
        message: `Failed to update EUDR deforestation status. ${error}`,
      };
    }
  }

  async detectDeforestationMassResult(requestId: string) {
    this.logger.warn("This is decect and get mass result back")
    try {
      const response = await withRetry(() =>
        axios.get<{ success: boolean; data: Record<string, unknown> }>(URL.DETECT_DEFORESTATION_MASS_RESULT, {
          headers: {
            'Auth-Token': CONSTANT.DEFORESTATION_API_KEY,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          params: {
            requestId,
          },
          baseURL: URL.BASEURL,
        })
      );
      return response.data;
    } catch (err) {
      console.error('Error getting detect-deforestation-mass-result.', err);
      throw new HttpException(err.message || 'Error getting detect-deforestation-mass-result', err.status || 500);
    }
  }

  async handleDeforestationCallBack(job: Job) {
    this.logger.warn("Seecond fetch ....This is logging from handle Deforestation Callback")
    try {
      const batches = job.payload.batches;
      const length = batches.length;
      const eudr_setting = job.payload.eudrSetting;
      if(!job.context) job.context = { completedBatchCount: 0 };
      if(!job.context.completedBatchCount) job.context.completedBatchCount = 0;
      const completedBatchCount = job.context.completedBatchCount;
      if(completedBatchCount === length) job.status = JobStatus.Completed;
      for (let i = completedBatchCount; i < length; i++) {
        const batch = batches[i];
        const isLastBatch = i === (length - 1);
        const farmIds = batch.reports.map(report => report.farmId);
        await Promise.all([
          this.updateEUDRBulkStatus(batch.eudrStatuses),
          this.processDeforestationReportRequestData(batch.reports, farmIds, Number(job.modelId)),
          this.processDeforestationByPs(batch.reports),
          this.processAndReCalculateTolleranne(job.modelId,eudr_setting)
        ]);
        job.context = { ...job.context, completedBatchCount: job.context.completedBatchCount + 1 };
        job.status = isLastBatch ? JobStatus.Completed : this.shouldPause ? JobStatus.Pending : JobStatus.Processing;
        await job.save();
        if(this.shouldPause) break;
      }
      if(job.status === JobStatus.Completed && job.modelId && job.modelType === 'DiligenceReport') {
        await this.DiligenceReportModel.update({ status: 'Ready to Proceed', current_step: 4 }, { where: { id: job.modelId } });
        this.sendDeforestationReadyNotification(job.modelId);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async processDeforestationReportRequestData(responseData: any, farmIds: number[], diligenceReportId: number) {
    await this.deforestationReportRequestModel.update(
      {
        isDeleted: true,
      },
      {
        where: {
          farmId: {
            [Op.in]: farmIds,
          },
        },
      }
    );
    const reportRequests = await this.deforestationReportRequestModel.bulkCreate(responseData, {
      include: [
        {
          model: DeforestrationSateliteResponse,
          as: 'sateliteResponse',
        },
        {
          model: ReportRequestCoordinates,
          as: 'coordinates',
        },
      ],
    });

    const reportPlaces = await this.ReportProductionPlaceModel.findAll({
      where: { farmId: { [Op.in]: farmIds }, diligenceReportId },
      include: [
        {
          model: Farm,
          as: 'farm',
          attributes: ['id', 'country'],
        }
      ]
    });

    await Promise.all(reportRequests.map(async report => {
      if(report.zoneId) return true;
      const reportPlace = reportPlaces.find(item => Number(item.farmId) == Number(report.farmId));
      if(!reportPlace) return false;
      const infoData = {
        deforestationReportRequestId: report.id,
        deforestationStatus: report.overallProb,
        originalDeforestationStatus: report.originalOverallProb,
        deforestationStatusDate: report.createdAt,
      };
      const newInfo = await this.PlaceDeforestationInfoModel.create(infoData);
      reportPlace.productionPlaceDeforestationInfoId = newInfo.id;
      await reportPlace.save();
      const productionPlace = await this.dueDiligenceProductionPlaceModel.findOne({
        where: { farmId: report.farmId }
      });
      if(productionPlace.latestGeofenceId == reportPlace.geofenceId) {
        productionPlace.productionPlaceDeforestationInfoId = newInfo.id;
        await productionPlace.save();
      }
      if(!report.errorStatus) {
        const responseItem = responseData.find(item => item.reportGuid == report.reportGuid);
        await this.writeDeforestationDataToSolana({
          farm: report.farmUUID,
          deforestationStatus: report.originalOverallProb || report.overallProb,
          reportVersion: report.reportVersion,
          transactableId: report.id,
          country: report.country || reportPlace.farm?.country,
          indigenousArea: responseItem?.indigenousLand?.length ? responseItem.indigenousLand[0] : 'No',
          protectedArea: responseItem?.protectedAreasAlerts?.length ? responseItem.protectedAreasAlerts[0] : 'No',
        });
      }
      return true;
    }));

    return true;
  }

  calculateOverallProbFromTolerance(result: any, toleranceLevel: any): EudrDeforestationStatus {
    const overallProb = result.overallProb;
    if (!toleranceLevel) return overallProb;
    if (
      overallProb === EudrDeforestationStatus.ZERO_NEGLIGIBLE_DEFORESTATION_PROBABILITY ||
      overallProb === EudrDeforestationStatus.ZERO_NEG_PROBABILITY
    )
      return overallProb;
    switch (overallProb) {
      case EudrDeforestationStatus.VERY_HIGH_DEFORESTATION_PROBABILITY:
      case EudrDeforestationStatus.VERY_HIGH_PROBABILITY:
        if (toleranceLevel.very_high >= result.veryHighProbPercent) return EudrDeforestationStatus.MANUALLY_MITIGATED;
        break;
      case EudrDeforestationStatus.HIGH_DEFORESTATION_PROBABILITY:
      case EudrDeforestationStatus.HIGH_PROBABILITY:
        if (toleranceLevel.high >= result.highProbPercent) return EudrDeforestationStatus.MANUALLY_MITIGATED;
        break;
      case EudrDeforestationStatus.MEDIUM_DEFORESTATION_PROBABILITY:
      case EudrDeforestationStatus.MEDIUM_PROBABILITY:
        if (toleranceLevel.medium >= result.mediumProbPercent) return EudrDeforestationStatus.MANUALLY_MITIGATED;
        break;
      case EudrDeforestationStatus.LOW_DEFORESTATION_PROBABILITY:
      case EudrDeforestationStatus.LOW_PROBABILITY:
        if (toleranceLevel.low >= result.lowProbPercent) return EudrDeforestationStatus.MANUALLY_MITIGATED;
        break;
      case EudrDeforestationStatus.VERY_LOW_DEFORESTATION_PROBABILITY:
      case EudrDeforestationStatus.VERY_LOW_PROBABILITY:
        if (toleranceLevel.very_low >= result.veryLowProbPercent) return EudrDeforestationStatus.MANUALLY_MITIGATED;
        break;
      default:
        return overallProb;
    }
    return overallProb;
  }

  createBatchForDeforestationJob(payloadData: any, pythonResponseData: any, eudrSetting: any, breakpointData: Record<string, number>) {
    const veryHighProbConfig = CONSTANT.DEFORESTATION_STATUS_CONFIG.find((config) => config.label === 'Very High');
    const highProbConfig = CONSTANT.DEFORESTATION_STATUS_CONFIG.find((config) => config.label === 'High');
    const mediumProbConfig = CONSTANT.DEFORESTATION_STATUS_CONFIG.find((config) => config.label === 'Medium');
    const lowProbConfig = CONSTANT.DEFORESTATION_STATUS_CONFIG.find((config) => config.label === 'Low');
    const veryLowProbConfig = CONSTANT.DEFORESTATION_STATUS_CONFIG.find((config) => config.label === 'Very Low');
    const zeroProbConfig = CONSTANT.DEFORESTATION_STATUS_CONFIG.find((config) => config.label === 'Zero');
    const BATCH_SIZE = 50;

    const geofenceDetails = new Map<
      number,
      {
        farmId: string | number;
        productionPlaceId:string | number;
        farmName: string;
        farmAddress: string;
        isPrimary: boolean;
        coordinates: {
          latitude: number;
          longitude: number;
        }[];
        centerLat: number;
        centerLog: number;
        radius: number;
      }
    >();

    const farmGeofenceIdMap = new Map<number, number[]>();
    const successAoiIds = new Set<number>();
    for(const item of pythonResponseData) {
      if(item.result) successAoiIds.add(item.aoiId);
    }
    payloadData.forEach((element) => {
      const center =
        element.coordinates && element.coordinates.length
          ? this.calculateCenterofPolygon(element.coordinates)
          : [element.latitude, element.longitude];

      geofenceDetails.set(Number(element.aoiId), {
        farmId: element.farmId,
        farmName: element.farmName,
        productionPlaceId:element?.productionPlaceId,
        farmAddress: element.farmAddress,
        coordinates: element.coordinates,
        centerLat: center[0],
        centerLog: center[1],
        radius: element.radius,
        isPrimary: element.isPrimary,
      });
      if(successAoiIds.has(Number(element.aoiId))) {
        if(farmGeofenceIdMap.has(Number(element.farmId))) {
          farmGeofenceIdMap.get(Number(element.farmId)).push(Number(element.aoiId));
        } else {
          farmGeofenceIdMap.set(Number(element.farmId), [Number(element.aoiId)]);
        }
      }
    });
    const eudrBulkStatusData = [];
    const reportRequestData = [];
    const groupedPythonResponseData = new Map<number, any[]>();
    for (const item of pythonResponseData) {
      if (!item.result) {
        const geofenceDetail = geofenceDetails.get(Number(item.aoiId));
        const geofenceCount = farmGeofenceIdMap.get(Number(geofenceDetail?.farmId))?.length;
        console.log(item)
        const reportData = {
          orgId: eudrSetting?.org_id,
          zoneId: geofenceCount > 1 ? item.aoiId: null,
          reportGuid: uuid.v4(),
          userId: item.userId,
          farmId: geofenceDetail?.farmId,
          productionPlaceId:geofenceDetail?.productionPlaceId,
          farmName: geofenceDetail?.farmName,
          locationName: geofenceDetail?.farmAddress,
          errorStatus: item.error_code,
          location_name:'' ,
          country:'' ,
          state:'' ,
          isCertified: 0,
          isCertificateReady: 0

        }

        reportRequestData.push(reportData);
      } else {

        const calculatedOverallProb = this.calculateOverallProbFromTolerance(item.result, eudrSetting?.riskToleranceLevels);
  
        const resultWithImage = this.getDeforestationReportSateliteData(
          null,
          item.result.allProbImageS3Key,
          item.result.finalDetectionS3Key
        );
        const geofenceDetail = geofenceDetails.get(Number(item.aoiId));
        const geofenceCount = farmGeofenceIdMap.get(Number(geofenceDetail?.farmId))?.length;
        eudrBulkStatusData.push({
          farmId: geofenceDetail.farmId,
          eudr_deforestation_status: calculatedOverallProb,
        });
        const reportData = {
          isDeleted: geofenceCount > 1,
          geofenceArea: item.result.totalArea * 2.471,
          orgId: eudrSetting?.org_id,
          zoneId: geofenceCount > 1 ? item.aoiId: null,
          reportGuid: uuid.v4(),
          userId: item.userId,
          farmId: geofenceDetail?.farmId,
          productionPlaceId:geofenceDetail?.productionPlaceId,
          farmName: geofenceDetail?.farmName,
          locationName: geofenceDetail?.farmAddress,
          farmerUUID: uuid.v4(),
          farmUUID: uuid.v4(),
          country: item.result.country ? item.result.country.name : '',
          state: '',
          indigenousLand:item.result.indigenousLand,
          protectedAreasAlerts:item.result.protectedAreasAlerts,
          centerLatitude: item.lat || item.latitude || geofenceDetail?.centerLat,
          centerLongitude: item.lng || item.longitude || geofenceDetail?.centerLog,
          geometryType: item.geometryType,
          issueDate: item.issueDate,
          circularDataSHA256: item.circularDataSHA256,
          polygonalDataSHA256: item.polygonalDataSHA256,
          modelVersion: item.modelVersion,
          reportVersion: item.reportVersion,
          radius: item.radius && !isNaN(Number(item.radius)) ? item.radius * 1000 : geofenceDetail?.radius ? Number(geofenceDetail.radius) * 1000 : null, // Python request object is in km, convert to meter
          title: item.title,
          highProb: item.result.highProb * 2.471, // convert to acre since we get in hectare from python, acre is default unit for us
          highProbPercent: item.result.highProbPercent,
          highProbColor: item.result.highProbColor || highProbConfig.colorCode,
          highProbColorName: item.result.highProbColorName || highProbConfig.colorName,
          lowProb: item.result.lowProb * 2.471, // convert to acre since we get in hectare from python, acre is default unit for us
          lowProbPercent: item.result.lowProbPercent,
          lowProbColor: item.result.lowProbColor || lowProbConfig.colorCode,
          lowProbColorName: item.result.lowProbColorName || lowProbConfig.colorName,
          totalArea: item.result.totalArea * 2.471, // convert to acre since we get in hectare from python, acre is default unit for us
          zeroProb: item.result.zeroProb * 2.471, // convert to acre since we get in hectare from python, acre is default unit for us
          zeroProbPercent: item.result.zeroProbPercent,
          zeroProbColor: item.result.zeroProbColor || zeroProbConfig.colorCode,
          zeroProbColorName: item.result.zeroProbColorName || zeroProbConfig.colorName,
          overallProb: calculatedOverallProb,
          originalOverallProb: item.result.overallProb,
          mediumProb: item.result.mediumProb * 2.471, // convert to acre since we get in hectare from python, acre is default unit for us,
          mediumProbPercent: item.result.mediumProbPercent,
          mediumProbColor: item.result.mediumProbColor || mediumProbConfig.colorCode,
          mediumProbColorName: item.result.mediumProbColorName || mediumProbConfig.colorName,
          veryHighProb: item.result.veryHighProb * 2.471, // convert to acre since we get in hectare from python, acre is default unit for us,
          veryHighProbPercent: item.result.veryHighProbPercent,
          veryHighProbColor: item.result.veryHighProbColor || veryHighProbConfig.colorCode,
          veryHighProbColorName: item.result.veryHighProbColorName || veryHighProbConfig.colorName,
          veryLowProb: item.result.veryLowProb * 2.471, // convert to acre since we get in hectare from python, acre is default unit for us,
          veryLowProbPercent: item.result.veryLowProbPercent,
          veryLowProbColor: item.result.veryLowProbColor || veryLowProbConfig.colorCode,
          veryLowProbColorName: item.result.veryLowProbColorName || veryLowProbConfig.colorName,
          sateliteResponse: resultWithImage,
          ...(geofenceDetail?.coordinates && { coordinates: geofenceDetail.coordinates }),
        };
        if(groupedPythonResponseData.has(Number(geofenceDetail?.farmId))) {
          groupedPythonResponseData.get(Number(geofenceDetail.farmId)).push(reportData);
        } else {
          groupedPythonResponseData.set(Number(geofenceDetail.farmId), [reportData]);
        }
        reportRequestData.push(reportData);
      }
    }

    for (const [farmId, childReports] of groupedPythonResponseData.entries()) {
      if(childReports.length <= 1) continue;
      const primaryReport = childReports.find(report => geofenceDetails.get(report.zoneId).isPrimary) || childReports[0];
      const reportData: any = { ...primaryReport };
      reportData.reportGuid = uuid.v4();
      for(let i = 0; i < childReports.length; i++) {
        const childReport = childReports[i];
        childReport.parentGuid = reportData.reportGuid;
        if(childReport === primaryReport) continue;
        childReport.farmerUUID = reportData.farmerUUID;
        childReport.farmUUID = reportData.farmUUID;
        reportData.veryHighProb += childReport.veryHighProb;
        reportData.highProb += childReport.highProb;
        reportData.mediumProb += childReport.mediumProb;
        reportData.lowProb += childReport.lowProb;
        reportData.veryLowProb += childReport.veryLowProb;
        reportData.zeroProb += childReport.zeroProb;
        reportData.geofenceArea += childReport.geofenceArea;
        reportData.totalArea += childReport.totalArea;
      }
      reportData.isDeleted = false;
      reportData.zoneId = null;
      reportData.veryHighProbPercent = (reportData.veryHighProb / reportData.totalArea) * 100;
      reportData.highProbPercent = (reportData.highProb / reportData.totalArea) * 100;
      reportData.mediumProbPercent = (reportData.mediumProb / reportData.totalArea) * 100;
      reportData.lowProbPercent = (reportData.lowProb / reportData.totalArea) * 100;
      reportData.veryLowProbPercent = (reportData.veryLowProb / reportData.totalArea) * 100;
      reportData.zeroProbPercent = (reportData.zeroProb / reportData.totalArea) * 100;
      if(reportData.veryHighProbPercent > breakpointData[EudrDeforestationStatus.VERY_HIGH_DEFORESTATION_PROBABILITY]) {
        reportData.overallProb = EudrDeforestationStatus.VERY_HIGH_DEFORESTATION_PROBABILITY;
      } else if(reportData.highProbPercent > breakpointData[EudrDeforestationStatus.HIGH_DEFORESTATION_PROBABILITY]) {
        reportData.overallProb = EudrDeforestationStatus.HIGH_DEFORESTATION_PROBABILITY;
      } else if(reportData.mediumProbPercent > breakpointData[EudrDeforestationStatus.MEDIUM_DEFORESTATION_PROBABILITY]) {
        reportData.overallProb = EudrDeforestationStatus.MEDIUM_DEFORESTATION_PROBABILITY;
      } else if(reportData.lowProbPercent > breakpointData[EudrDeforestationStatus.LOW_DEFORESTATION_PROBABILITY]) {
        reportData.overallProb = EudrDeforestationStatus.LOW_DEFORESTATION_PROBABILITY;
      } else if(reportData.veryLowProbPercent > breakpointData[EudrDeforestationStatus.VERY_LOW_DEFORESTATION_PROBABILITY]) {
        reportData.overallProb = EudrDeforestationStatus.VERY_LOW_DEFORESTATION_PROBABILITY;
      } else {
        reportData.overallProb = EudrDeforestationStatus.ZERO_NEGLIGIBLE_DEFORESTATION_PROBABILITY;
      }
      reportData.overallProb = this.calculateOverallProbFromTolerance(reportData, eudrSetting?.riskToleranceLevels);
      reportRequestData.push(reportData);
      eudrBulkStatusData.push({
        farmId,
        eudr_deforestation_status: reportData.overallProb,
      });
    }

    const batches = [];
    for (let i = 0; i < Math.max(eudrBulkStatusData.length, reportRequestData.length); i += BATCH_SIZE) {
      batches.push({
        eudrStatuses: eudrBulkStatusData.slice(i, i + BATCH_SIZE),
        reports: reportRequestData.slice(i, i + BATCH_SIZE),
      });
    }
    return batches;
  }

  async getDeforestationBreakpoint() {
    try {
      const response = await withRetry(() =>
        axios.get<{ status: boolean; data: Record<string, number> }>(URL.GET_DEFORESTATION_BREAKPOINT, {
          headers: {
            'Auth-Token': CONSTANT.DEFORESTATION_API_KEY,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          baseURL: URL.BASEURL,
        })
      );
      return response.data.data;
    } catch (err) {
      console.error('Error getting deforestation breakpoint.', err);
      return {} as Record<string, number>;
    }
  }

  async updateJobForDeforestationCallback(requestId: string): Promise<void> {
    const { success, data } = await this.detectDeforestationMassResult(requestId);
    this.logger.warn("This is logging from updatte job for deforestation callback")
    const breakpointData = await this.getDeforestationBreakpoint();
    if (!success) {
      throw new Error((data.message as string) || 'Failed to get deforestation data');
    }
    const job = await this.jobService.findByExternalId(requestId);
    if(!job) return;
    const deforestationBatchData = this.createBatchForDeforestationJob(
      job.payload.payloadData,
      data,
      job.payload.eudrSetting,
      breakpointData,
    );
    job.payload = {
      ...job.payload,
      command: 'INIT_CALLBACK',
      batches: deforestationBatchData,
    };
    job.status = JobStatus.Pending;
    await job.save();
    await this.jobService.initJobsProcessing();
  }

  async createJobForDiligenceDeforestationReport(
    diligenceId: number | string,
    orgId: number,
    lang: string = 'en'
  ): Promise<Job> {
    const eudrSetting = await this.EudrSettingModel.findOne({
      where: {
        org_id: orgId,
      },
      attributes: ['id', 'org_id', "dynamicExpiryTime", "dynamicExpiryTimePeriod"],
      include: [
        {
          model: DeforestationAssessmentRiskToleranceLevels,
          as: 'riskToleranceLevels',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
      ],
    });

    // Set deforestationStatusDate to an old year (2020) to force re-request
    const oldDate = new Date('2020-01-01');
    
    // Get deforestation report request IDs through the production places relationship
    const productionPlaces = await this.ReportProductionPlaceModel.findAll({
      where: { diligenceReportId: diligenceId },
      include: [
        {
          model: ProductionPlaceDeforestationInfo,
          required: true,
          attributes: ['deforestationReportRequestId']
        }
      ]
    });
    
    const deforestationReportRequestIds = productionPlaces
      .map(place => place.productionPlaceDeforestationInfo?.deforestationReportRequestId)
      .filter(id => id !== null && id !== undefined);
    
    if (deforestationReportRequestIds.length > 0) {
      await this.PlaceDeforestationInfoModel.update(
        {
          deforestationStatusDate: oldDate,
        },
        {
          where: {
            deforestationReportRequestId: {
              [Op.in]: deforestationReportRequestIds
            }
          }
        }
      );
    }

    const job = await this.jobService.create({
      modelId: diligenceId.toString(),
      modelType: 'DiligenceReport',
      payload: {
        command: 'REQUEST',
        module: 'DEFORESTATION_REPORT',
        lang,
        eudrSetting,
      },
      context: {},
    });
    await this.DiligenceReportModel.update(
      {
        status: 'Analyzing Deforestation',
      },
      {
        where: {
          id: diligenceId,
        },
      }
    );
    return job;
  }

  async requestDeforestationReport(job: Job) {
    this.logger.warn("Requst ....first..... deforestion request initiatee.....")
    const result = await this.getBulkDeforestationByDiligenceId(parseInt(job.modelId), job.payload.lang, job.payload.eudrSetting);
    
    await this.DiligenceReportModel.update({ is_dds_status_update: 1 }, { where: { id: parseInt(job.modelId) } });
    if(!result.payloadData.length) {
      job.payload = { ...job.payload, payloadData: result.payloadData };
      job.status = JobStatus.Completed;
      await job.save();
      if(job.modelId && job.modelType === 'DiligenceReport') {
        await this.DiligenceReportModel.update({ status: 'Ready to Proceed', current_step: 4 }, { where: { id: job.modelId } });
        this.sendDeforestationReadyNotification(job.modelId);
      }
      return;
    }
    const responseData = result.responseData;
    if (responseData?.success) {
      job.payload = { ...job.payload, payloadData: result.payloadData };
      job.externalId = responseData.data.request_id;
      job.status = JobStatus.OnHold;
      await job.save();
    } else {
      throw new Error(responseData?.message || 'Python API request failed to provide useful response');
    }
  }

  async runJob(job: Job): Promise<Job> {
    try {
      this.initRun(job);
      const command = job.payload.command;
      if (typeof command !== 'string') return;
      switch (command) {
        case 'REQUEST':
          this.logger.warn("The deforestion request initiatee.....")
          await this.requestDeforestationReport(job);
          break;
        case 'INIT_CALLBACK':
          this.logger.warn("the init callback hits................")
          await this.handleDeforestationCallBack(job);
          break;
        default:
          break;
      }
      this.markJobAsComplete(job);
      return job;
    } catch (error) {
      this.removeJob(job);
      console.error(error);
      if (job.modelId && job.modelType === 'DiligenceReport') {
        await this.DiligenceReportModel.update({ status: 'Ready to Proceed', current_step: 4 }, { where: { id: job.modelId } });
        this.sendDeforestationReadyNotification(job.modelId)
      }
      throw error;
    }
  }

  async sendDeforestationReadyNotification(diligenceReportId: string) {
    const reportDetail = await this.DiligenceReportModel.findOne({
      where:{
        id: diligenceReportId
      },
      include:[
        {
            model: UserDDS,
            as:'user',
            required: true
        }
      ]
    })
    await this.messageQueueingService.publishNotification({
      title: "Deforestation Report Generated",
      message: "Deforestation report generate. Tap here to review.",
      type: "deforestation_report",
      notify:"admin",
      userId: reportDetail.user.cf_userid,
      users: [reportDetail.user.cf_userid],
      data: JSON.stringify({
        reportId: diligenceReportId,
        redirectionPath:""
      })
    })
  }

  async detectDeforestationBulk(
    detectDeforestationCircleInput: DetectDeforestationBulkInput[],
  ) {
    try {

     const items = detectDeforestationCircleInput.map((data) => {     
      if(data?.type === 'circular') {
        return data?.coordinates?.map((coordinate) => {
          return {
            aoiId: data.aoiId,
            userId: 1,
            radius: 1,
            latitude: Number(coordinate?.latitude),
            longitude: Number(coordinate?.longitude),
          };
        });
      }

      return {
        aoiId: data.aoiId,
        userId: 1,
        name: data.name,
        coordinates: data?.coordinates?.map((coordinate) => {
          return {
            latitude: Number(coordinate?.latitude),
            longitude: Number(coordinate?.longitude),
          }
        })
      }
    }).flat(1);
     
      const response = await this.apiCallHelper.call(
        RequestMethod.POST,
        URL.BASEURL + URL.DETECT_DEFORESATION_BULK,
        {
          'Auth-Token': CONSTANT.DEFORESTATION_API_KEY,
        },
        {
          "items": items
        }
      );
     
      const pythonResponses =  response.data?.data?.map((data) => {
        return  data
      }).flat(1);

      if(pythonResponses.length === 0) {

        return await Promise.all(
          detectDeforestationCircleInput.map(async (data) => {
            const [dueDiligenceProductionPlacesPyData] = await DueDiligenceProductionPlacesPyData.findOrCreate({
              where: { 
                productionPlaceId: data?.productionPlaceId
              },
              defaults: {
                productionPlaceId: data?.productionPlaceId,
                farmId: data?.aoiId,
                indigenousArea:  'python_model_response_error',
                protectedArea: 'python_model_response_error'
              }
            })
            return dueDiligenceProductionPlacesPyData;
          })
        )
      }

      return await Promise.all(
        pythonResponses.map(async (pythonResponse) => {
          const [farmData] = detectDeforestationCircleInput.filter((input) => input?.aoiId === pythonResponse?.aoiId);

          const [dueDiligenceProductionPlacesPyData] = await DueDiligenceProductionPlacesPyData.findOrCreate({
            where: { 
              productionPlaceId: farmData?.productionPlaceId
            },
            defaults: {
              productionPlaceId: farmData?.productionPlaceId,
              farmId: pythonResponse?.aoiId,
              indigenousArea: pythonResponse?.indigenousLand?.length > 0 ? pythonResponse?.indigenousLand[0] : (pythonResponse?.error_code  ? pythonResponse?.error_code  : 'N/A'),
              protectedArea: pythonResponse?.protectedAreasAlerts?.length > 0 ? pythonResponse?.protectedAreasAlerts[0] : (pythonResponse?.error_code  ? pythonResponse?.error_code  : 'N/A'),
            }
          })

          return dueDiligenceProductionPlacesPyData;
        })
      );
    } catch (err) {
      throw new Error('pythonServerError');
    }
  }


  async processDeforestationByPs(reports: any) {
    this.logger.warn("PSy data inserting...");

    if (!reports || reports.length === 0) return;

    const productionPlaceIds = reports.map(report => report.productionPlaceId);

    // Fetch existing records with matching productionPlaceIds
    const existingRecords = await DueDiligenceProductionPlacesPyData.findAll({
        where: { productionPlaceId: productionPlaceIds },
        attributes: ['id', 'productionPlaceId', 'farmId'] // Include primary key (if exists)
    });

    // Convert existing records to a map for quick lookup
    const existingMap = new Map(
        existingRecords.map(record => [`${record.productionPlaceId}_${record.farmId}`, record])
    );

    // Separate records into updates and inserts
    const updates: any[] = [];
    const inserts: any[] = [];

    for (let report of reports) {
        const key = `${report.productionPlaceId}_${report.farmId}`;

        const data = {
            productionPlaceId: report.productionPlaceId,
            farmId: report.farmId,
            indigenousArea: report.indigenousLand?.length > 0 ? report.indigenousLand[0] : (report?.errorStatus ? report.errorStatus : 'N/A'),
            protectedArea: report.protectedAreasAlerts?.length > 0 ? report.protectedAreasAlerts[0] : (report?.errorStatus ? report.errorStatus : 'N/A')
        };

        if (existingMap.has(key)) {
            // If exists, update the record
            updates.push({ ...data, id: existingMap.get(key).id });
        } else {
            // If not exists, insert a new record
            inserts.push(data);
        }
    }
    if (updates.length > 0) {
        await Promise.all(
            updates.map(update =>
                DueDiligenceProductionPlacesPyData.update(update, {
                    where: { id: update.id }
                })
            )
        );
    }
    if (inserts.length > 0) {
        await DueDiligenceProductionPlacesPyData.bulkCreate(inserts);
    }

    this.logger.warn("PSy data inserted/updated successfully!");
  }

  async processAndReCalculateTolleranne(reportID, eudr_setting=null) {
    const riskTolleranceLevel = eudr_setting.riskToleranceLevels
    const reportId = Number(reportID)

    const status = [
      "Very High Probability",
      "High Probability",
      "Very High Deforestation Probability",
      "High Deforestation Probability"
    ]

    const farmProductionPlaces = await this.ReportProductionPlaceModel.findAll({
      where:{
        diligenceReportId:reportId,
      },
      attributes:['id','farmId','dueDiligenceProductionPlaceId']
    })

    const candidateProductionPlaces = await this.dueDiligenceProductionPlaceModel.findAll({
      attributes:['id','farmId','eudr_deforestation_status'],
      where:{
        id:{
          [Op.in]:farmProductionPlaces.map(x => x.dueDiligenceProductionPlaceId)
        },
      },
      include:[
         {
          model:ProductionPlaceDeforestationInfo,
          as:"productionPlaceDeforestationInfo",
          where:{
            deforestationStatus:{
              [Op.in]:status
            }
          }
         }
      ]
    })

    const a  = candidateProductionPlaces.map(x => x.id)
    const deforestationRequests = await this.deforestationReportRequestModel.findAll({
      where:{
        farmId:{
          [Op.in]:candidateProductionPlaces.map(x => x.farmId)
        }
      },
      order:[['id','desc']]
    })

    const b = deforestationRequests.map(x => x.id)
    for(let production of candidateProductionPlaces) {
       const reportRequest = deforestationRequests.filter(x => Number(x.farmId) == production.farmId)
       if(reportRequest.length){
          const firstReport = reportRequest[0]
          const tolleranceStatus = this.calculateOverallProbFromTolerance(firstReport, riskTolleranceLevel)
          this.logger.warn(tolleranceStatus)
          production.eudr_deforestation_status = tolleranceStatus
          production.productionPlaceDeforestationInfo.deforestationStatus = tolleranceStatus
          production.productionPlaceDeforestationInfo.save()
          await production.save()
       }
    }
  }

  async writeDeforestationDataToSolana(reportRequestIdOrData: number | DeforestationDataOnSolana, delay?: number) {
    if(typeof reportRequestIdOrData === 'object') {
      if(!reportRequestIdOrData.deforestationStatus) return;
      reportRequestIdOrData.country = reportRequestIdOrData.country
        ? reportRequestIdOrData.country.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        : null;
      // Convert data to the expected format
      const country = reportRequestIdOrData.country
        ? COUNTRIES.find(
            (item) =>
              item.name.toLowerCase() === reportRequestIdOrData.country.toLowerCase() ||
              item.code.toLowerCase() === reportRequestIdOrData.country.toLowerCase() ||
              item.code3.toLowerCase() === reportRequestIdOrData.country.toLowerCase()
          )?.code || reportRequestIdOrData.country
        : null;
      const data: DeforestationDataOnSolana = {
        ...reportRequestIdOrData,
        country: country || '--',
        deforestationStatus: reportRequestIdOrData.deforestationStatus.replace(' Deforestation Probability', ''),
        protectedArea:
          reportRequestIdOrData.protectedArea.startsWith('No') ||
          reportRequestIdOrData.protectedArea === 'N/A' ||
          reportRequestIdOrData.protectedArea === 'NA'
            ? 'No invasion'
            : reportRequestIdOrData.protectedArea,
        indigenousArea:
          reportRequestIdOrData.indigenousArea.startsWith('No') ||
          reportRequestIdOrData.indigenousArea === 'N/A' ||
          reportRequestIdOrData.indigenousArea === 'NA'
            ? 'No invasion'
            : reportRequestIdOrData.indigenousArea,
      };
      return this.solanaService.addDeforestationTransactionToQueue(data, 10, delay);
    }

    const deforestationReportRequest = await this.deforestationReportRequestModel.findOne({
      where: {
        id: reportRequestIdOrData,
      },
    });

    if (!deforestationReportRequest || deforestationReportRequest.errorStatus) {
      console.log('Deforestation report request not found');
      return null;
    }

    const dueDiligenceProdutionPlacePyData = await DueDiligenceProductionPlacesPyData.findOne({
      where: {
        farmId: deforestationReportRequest.farmId,
      }
    });

    const reportCountry = deforestationReportRequest.country ? deforestationReportRequest.country.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : null;
    const country = deforestationReportRequest.country
      ? COUNTRIES.find(
          (item) =>
            item.name.toLowerCase() === reportCountry.toLowerCase() ||
            item.code.toLowerCase() === reportCountry.toLowerCase() ||
            item.code3.toLowerCase() === reportCountry.toLowerCase()
        )?.code || reportCountry
      : null;
    const data: DeforestationDataOnSolana = {
      transactableId: deforestationReportRequest.id,
      farm: deforestationReportRequest.farmUUID,
      country: country || '--',
      deforestationStatus: (deforestationReportRequest.originalOverallProb || deforestationReportRequest.overallProb).replace(
        ' Deforestation Probability',
        ''
      ),
      protectedArea: dueDiligenceProdutionPlacePyData?.protectedArea
        ? dueDiligenceProdutionPlacePyData.protectedArea.startsWith('No') ||
          dueDiligenceProdutionPlacePyData.protectedArea === 'N/A' ||
          dueDiligenceProdutionPlacePyData.protectedArea === 'NA'
          ? 'No invasion'
          : dueDiligenceProdutionPlacePyData.protectedArea
        : 'No invasion',
      indigenousArea: dueDiligenceProdutionPlacePyData?.indigenousArea
        ? dueDiligenceProdutionPlacePyData.indigenousArea.startsWith('No') ||
          dueDiligenceProdutionPlacePyData.indigenousArea === 'N/A' ||
          dueDiligenceProdutionPlacePyData.indigenousArea === 'NA'
          ? 'No invasion'
          : dueDiligenceProdutionPlacePyData.indigenousArea
        : 'No invasion',
      reportVersion: deforestationReportRequest.reportVersion,
    };

    return this.solanaService.addDeforestationTransactionToQueue(data, 10, delay);
  }

  async writeMissingCountryForDeforestationReport() {
    const LIMIT = 100;

    let totalCount = 0;
    let updatedCount = 0;

    while(true) {
      const reports = await this.sequelize.query<{
        id: number,
        lat?: number | null,
        lng?: number | null,
        country?: string | null,
        address?: string | null,
        mappedCountry?: string | null,
      }>(`
        SELECT
          DISTINCT(drr.id) as id,
          COALESCE(drr.center_latitude, (SELECT latitude FROM report_request_coordinates rrc WHERE rrc.report_request_id = drr.id LIMIT 1)) as lat,
          COALESCE(drr.center_longitude, (SELECT latitude FROM report_request_coordinates rrc WHERE rrc.report_request_id = drr.id LIMIT 1)) as lng,
          uf.country as country,
          COALESCE(drr.location_name, uf.address) as address
        FROM
          deforestation_report_requests drr
        LEFT JOIN user_farms uf 
        ON
          drr.farm_id = uf.id
        WHERE
          drr.errorStatus IS NULL
          AND
          (drr.country IS NULL
            OR drr.country = '')
        LIMIT ${LIMIT}
      `, {
        type: QueryTypes.SELECT,
      });

      if(!reports.length) break;
      
      totalCount += reports.length;

      const countryToReportIds: Record<string, number[]> = {};
      for(const report of reports) {
        if((report.country && report.country.trim().length)) {
          report.mappedCountry =
            COUNTRIES.find(
              (country) =>
                country.code === report.country.toUpperCase() ||
                country.code3 === report.country.toUpperCase() ||
                country.name.toLowerCase() === report.country.toLowerCase()
            )?.name || null;
        }
  
        if(!report.mappedCountry && report.address && report.address.trim().length) {
          const address = report.address.replace(/[^a-zA-Z0-9\s,]/g, '').trim();
          const addressParts = address.split(',').map(part => part.trim());
          report.mappedCountry = COUNTRIES.find(
            (country) => addressParts.includes(country.code) || addressParts.includes(country.code3) || addressParts.includes(country.name)
          )?.name || null;
        }
  
        if(!report.mappedCountry && report.lat && report.lng) {
          const lookUpResult = lookUp(report.lat, report.lng);
          if(lookUpResult) {
            const country = COUNTRIES.find(country => country.code === lookUpResult.country_a2);
            report.mappedCountry = country ? country.name : null;
          }
        }

        if(report.mappedCountry) {
          countryToReportIds[report.mappedCountry] = [...(countryToReportIds[report.mappedCountry] || []), report.id];
        }
      }

      for (const [country, reportIds] of Object.entries(countryToReportIds)) {
        if (!country || !reportIds.length) continue;

        await this.deforestationReportRequestModel.update({ country }, { where: { id: { [Op.in]: reportIds } } });

        updatedCount += reportIds.length;
      }

      if(reports.length < LIMIT) break;
    }

    return {
      totalCount,
      updatedCount,
    }
  }

  async writeMissingSolanaTransaction(totalRecords = 100, offset = 0, baseDelay = 0) {
    const MAX_RECORDS = 10000;

    if(totalRecords > MAX_RECORDS) {
      throw new Error(`Total records cannot exceed ${MAX_RECORDS}`);
    }

    const reports = await this.sequelize.query<DeforestationDataOnSolana>(
      `
      SELECT
        drr.id as transactableId,
        drr.farm_UUID as farm,
        drr.country as country,
        COALESCE(drr.originalOverallProb, drr.overallProb) as deforestationStatus,
        COALESCE(drr.reportVersion, 1) as reportVersion,
        COALESCE(ddpppd.protectedArea, 'No invasion') as protectedArea,
        COALESCE(ddpppd.indigenousArea, 'No invasion') as indigenousArea
      FROM
        deforestation_report_requests drr
      LEFT JOIN due_diligence_production_places_py_data ddpppd 
      ON drr.farm_id = ddpppd.farmId
      WHERE
        drr.id NOT IN (
        SELECT
          transactableId
        FROM
          solana_transactions st
        WHERE
          st.transactableType = "deforestation" AND st.isSuccess = true)
        AND drr.errorStatus IS NULL
        AND COALESCE(drr.originalOverallProb, drr.overallProb) IS NOT NULL
        AND COALESCE(drr.originalOverallProb, drr.overallProb) != ''
        AND drr.farm_UUID IS NOT NULL
      ORDER BY drr.created_at ASC, drr.id ASC
      LIMIT ${totalRecords}
      OFFSET ${offset};
      `,
      {
        type: QueryTypes.SELECT,
      }
    );

    if (!reports.length) return {
      totalRecords: reports.length,
    };

    await Promise.all(
      reports.map((report, index) => {
        const reportDelay = baseDelay + (index * 15000); // 15 seconds delay for each report in the batch
        return this.writeDeforestationDataToSolana(report, reportDelay);
      })
    );

    return {
      totalRecords: reports.length,
      ids: reports.map(report => report.transactableId),
    }
  }

  async writeAllMissingSolanaTransaction()
  {
    const writesPerMonth = [10000, 20000, Infinity]; // month targets
    const msPerMinute = 60 * 1000;

    let startMoment = moment.utc();
    let currentDay = 0;
    let totalMonthWrites = 0;
    const configResult: {
      SolanaWrites: number;
      DelayFromStartDay: number;
      Day: number;
      Month: number;
      Time: string;
      ids?: (string | number)[];
    }[] = [];
    let delayMs = 0;
    let month = 0;

    for (let i = 0; i < HISTORICAL_DEFORESTATION_WRITE_CONFIG.length; i++) {
      const { 'Solana Writes': writes, 'Minutes After Quarter': after } = HISTORICAL_DEFORESTATION_WRITE_CONFIG[i];
      const baseMinutes =
        ((totalMonthWrites + writes > (writesPerMonth[month] || Infinity) ? 4 : 0) +
          (Math.floor(Math.random() * 2) + 2)) *
        60;
      const additionalDelay = Math.round(((baseMinutes + after) + ((writes * 15) / 60))) * msPerMinute;
      totalMonthWrites += writes;

      if(startMoment.clone().add(delayMs + additionalDelay, 'ms').dayOfYear() != startMoment.clone().add(delayMs, 'ms').dayOfYear()) {
        currentDay++;
        if(currentDay >= (Math.min(month + 1, writesPerMonth.length - 1) * 30)) {
          month = Math.min(month + 1, writesPerMonth.length - 1);
          totalMonthWrites = 0;
        }
      }

      delayMs += additionalDelay;

      configResult.push({
        SolanaWrites: writes,
        DelayFromStartDay: delayMs,
        Day: currentDay,
        Month: month,
        Time: startMoment.clone().add(delayMs, 'ms').toString(),
      });
    }

    let totalQueued = 0;
    for(const item of configResult) {
      const { totalRecords, ids } = await this.writeMissingSolanaTransaction(item.SolanaWrites, totalQueued, item.DelayFromStartDay);
      totalQueued += totalRecords;
      item.ids = ids;
    }

    // Write remaining transaction if exist
    await this.writeMissingSolanaTransaction(10000, totalQueued, configResult[configResult.length - 1]?.DelayFromStartDay || 0);
    return {
      totalQueued,
      writesPerMonth: configResult.reduce((prev, cur) => {
        const monthIdx = cur.Month;
        prev[monthIdx] = (prev[monthIdx] || 0) + ((cur.ids && typeof cur.ids?.length === 'number') ? cur.ids.length : cur.SolanaWrites);
        return prev;
      }, {}),
      expectedWritesPerMonth: configResult.reduce((prev, cur) => {
        const monthIdx = cur.Month;
        prev[monthIdx] = (prev[monthIdx] || 0) + cur.SolanaWrites;
        return prev;
      }, {}),
      mainResult: configResult,
    };
  }
}