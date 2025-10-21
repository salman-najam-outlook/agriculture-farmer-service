import { Inject, Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreatePastureMgmtInput } from './dto/create-pasture-mgmt.input';
import {
  UpdatePastureMgmtInput,
  UpdatePastureReport,
} from './dto/update-pasture-mgmt.input';
import { PastureMgmt } from './entities/pasture-mgmt.entity';
import { Sequelize } from 'sequelize-typescript';
import * as moment from 'moment';
import 'moment-timezone';
import { PastureMgmtCoordinates } from './entities/pasture-mgmt-coordinates.entity';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ReportTypes } from './entities/report-types.entity';
import { sqs } from './utils/s3-config';
import { Op, Sequelize as sequelize } from 'sequelize';
import { isEmpty } from 'lodash';
import { CONSTANT } from 'src/config/constant';
import { S3Service } from '../upload/upload.service';

@Injectable()
export class PastureMgmtService {
  constructor(
    @InjectModel(PastureMgmt)
    private PastureMgmtModel: typeof PastureMgmt,
    @InjectModel(PastureMgmtCoordinates)
    private PastureMgmtCoordModel: typeof PastureMgmtCoordinates,
    @InjectModel(ReportTypes)
    private ReportTypesModel: typeof ReportTypes,
    @Inject('SEQUELIZE')
    private readonly sequelize: Sequelize,
    private readonly s3Service: S3Service,
  ) {}
  async create(createPastureMgmtInput: CreatePastureMgmtInput, userId: number) {
    console.log(createPastureMgmtInput,"createPastureMgmtInputcreatePastureMgmtInput")
    let t = await this.sequelize.transaction();
    let { dateOfInterest, locationInfo, locationName, segment ,createdAt} =
      createPastureMgmtInput;

    if (!moment(new Date(dateOfInterest)).isValid()) {
      return 'Date of Interest must be date';
    }
   // let currentDate = moment(new Date(createdAt)).format('YYYY-MM-DD HH:mm:ss');


    var date = new Date(createdAt);
    let currentDate =  date.getFullYear() + "-" +
  ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
  ("00" + date.getDate()).slice(-2) + " " +
  ("00" + date.getHours()).slice(-2) + ":" +
  ("00" + date.getMinutes()).slice(-2) + ":" +
  ("00" + date.getSeconds()).slice(-2);

  console.log("currentDatecurrentDatecurrentDatecurrentDate",currentDate)
// console.log(dateStr);

    //Getting Server's TImeZone
    let tz = moment.tz.guess();

    // Changing User requested Date and time to server's time zone for future check
    let dateOfInterestLocalTimeZone = moment.tz(new Date(dateOfInterest), tz);

    if (moment(dateOfInterestLocalTimeZone).isAfter()) {
      return 'Date of Interest must be from past';
    }
    let checkInprogress = await this.checkInProgressReports(userId, t);
    if (checkInprogress > 0) {
      return 'New report requests can be submitted after completing current report requests';
    }
    let dateOfInterestFormat = moment(new Date(dateOfInterest)).format(
      'YYYY-MM-DD',
    );

    console.log(currentDate,"currentDatecurrentDatecurrentDate")

    let set = {
      userId,
      dateOfInterest: dateOfInterestFormat,
      locationName,
      segment,
      createdAt: currentDate,
      status: 'PENDING',
      centerLatitude: 0,
      centerLongitude: 0,
      coordinates: [],
    };

    const centroidPolygon = await this.calculateCenteroiPolygon(
      locationInfo.coordinates,
    );
    const reportDataWithCenterPoints = await this.checkExistingData(
      centroidPolygon,
      set.userId,
      set.dateOfInterest,
      t,
    );

    if (reportDataWithCenterPoints && reportDataWithCenterPoints.data) {
      // If record found but from other user
      if (!reportDataWithCenterPoints.isSameUser) {
        const reportDataToInsert = await this.composeDataForInserting(
          reportDataWithCenterPoints.data,
          set.userId,
          set.dateOfInterest,
          set.createdAt,
        );
        const insertData = await this.insertExistingData(reportDataToInsert, t);
        if (insertData) {
          t.rollback();
          return 'Report already created';
        }
      } else {
        // Record Forund for the same user so we don't have to insert again
        t.rollback();
        return 'Report already created';
      }
    } else {
      set.centerLatitude = centroidPolygon[0];
      set.centerLongitude = centroidPolygon[1];
      set.coordinates = locationInfo.coordinates;
      const reportTypes = await this.getReportTypesCountAndData(t);

      // Composing the insertion data on base of report type
      let reportDataToInsert = [];
      if (reportTypes.data != null) {
        for (const reportType of reportTypes.data) {
          let setNew = {
            ...set,
            reportType: reportType.name,
          };
          Object.keys(setNew).forEach((key) => {
            setNew[key] == undefined || setNew[key] == null
              ? delete setNew[key]
              : {};
          });
          reportDataToInsert.push(setNew);
        }
        const insertData = await this.insertExistingData(reportDataToInsert, t);

        if (insertData) {
          try {
            let sqsRes = await this.sendMsgToSQS(set.userId, currentDate);
            return 'Report added';
          } catch (error) {
            return 'Something went wrong';
          }
        }
      } else {
        t.rollback();
      }
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    search,
    order,
    orderField,
    userId: number,
    status: string,
    createdAt: Date,
    dateOfInterest: Date,
  ) {
    let query: { order: any; where: any; offset: any; limit: any };
    query = { order: 'asc', where: { userId: userId, is_deleted: 0 }, offset: 0, limit: 10 };

    if (orderField && order) {
      query.order = [[orderField, order]];
    } else {
      query.order = [['createdAt', 'ASC']];
    }
    if (search) {
      query.where = {
        userId: userId,
        [Op.or]: [
          { dateOfInterest: { [Op.like]: `%${search}%` } },
          { reportType: { [Op.like]: `%${search}%` } },
          { locationName: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    if (status) {
      query.where = {
        status: status,
      };
    }
    if (typeof createdAt == "string") {
      query.where = {
        [Op.and]: [
          sequelize.where(
            sequelize.fn('date', sequelize.col('createdAt')),
            '=',
            createdAt,
          ),
        ],
      };
    }
    if (typeof dateOfInterest == "string") {
      query.where = {
        [Op.and]: [
          sequelize.where(
            sequelize.fn('date', sequelize.col('dateOfInterest')),
            '=',
            dateOfInterest,
          ),
        ],
      };
    }

    if (page && limit && !search) {
      limit = limit;
      query.offset = (page - 1) * limit;
      query.limit = limit;
    }

    let res: { totalCount?: any; count: any; rows: any };
    res = await this.PastureMgmtModel.findAndCountAll(query);

    let reportRows = [];
    reportRows = res.rows;

    for (let i = 0; i < reportRows.length; i++) {
      if (reportRows[i].reportS3Key) {
        const params = {
          Bucket: process.env.AWS_REPORT_BUCKET,
          Key: reportRows[i].reportS3Key,
          Expires: 60 * 60,
          ResponseContentType: 'application/pdf',
        };
        // console.log(params);

        let urlRes = await this.getSignedURLs3West('getObject', params);

        reportRows[i].reportS3Key = urlRes;
      }
    }

    res.totalCount = res.count;
    res.count = res.rows.length;
    return res;
  }

  async findAllToday(
    page = 1,
    limit = 10,
    search,
    order,
    orderField,
    userId: number,
  ) {
    try {
      let TODAY_START = new Date();
      TODAY_START.setHours(0, 0, 0, 0);
      const NOW = new Date();
      let query: any = {
        order: 'asc',
        offset: 0,
        limit: 10,
        where: { userId: userId },
      };

      if (orderField && order) {
        query.order = [[orderField, order]];
      } else {
        query.order = [['createdAt', 'ASC']];
      }

      if (search) {
        query.where = {
          userId: userId,
          [Op.or]: [
            { dateOfInterest: { [Op.like]: `%${search}%` } },
            { reportType: { [Op.like]: `%${search}%` } },
            { locationName: { [Op.like]: `%${search}%` } },
          ],
          createdAt: {
            [Op.gt]: moment(TODAY_START).format('yyyy-MM-DD HH:mm:ss.s'),
            [Op.lt]: moment(NOW).format('yyyy-MM-DD HH:mm:ss.s'),
          },
        };
      }

      query.where.createdAt = {
        [Op.gt]: moment(TODAY_START).format('yyyy-MM-DD HH:mm:ss.s'),
        [Op.lt]: moment(NOW).format('yyyy-MM-DD HH:mm:ss.s'),
      };

      query.where.is_deleted = 0

      if (page && limit && !search) {
        limit = limit;
        query.offset = (page - 1) * limit;
        query.limit = limit;
      }

      let res: { totalCount?: any; count: any; rows: any };
      res = await this.PastureMgmtModel.findAndCountAll(query);

      let reportRows = [];
      reportRows = res.rows;

      for (let i = 0; i < reportRows.length; i++) {
        if (reportRows[i].reportS3Key) {
          const params = {
            Bucket: process.env.AWS_REPORT_BUCKET,
            Key: reportRows[i].reportS3Key,
            Expires: 60 * 60,
            ResponseContentType: 'application/pdf',
          };
          // console.log(params);

          let urlRes = await this.getSignedURLs3West('getObject', params);

          reportRows[i].reportS3Key = urlRes;
        }
      }

      res.totalCount = res.count;
      res.count = res.rows.length;

      return res;
    } catch (error) {
      throw error;
    }
  }

  findAllRecent(
    page = 1,
    limit = 10,
    search,
    order,
    orderField,
    userId: number,
  ) {
    return `This action returns all pastureMgmt`;
  }

  async findOne(id: number) {
    const report = await this.PastureMgmtModel.findOne({
      where: { id: id, is_deleted: 0 },
      attributes: ['id', 'reportType', 'dateOfInterest', 'userId', 'status'],
      include: [
        {
          attributes: ['latitude', 'longitude'],
          model: PastureMgmtCoordinates,
        },
      ],
    });
    if (!report) throw new HttpException('Report doesnt exists', 400);
    return { data: { info: report }, success: true };
  }

  async update(id: number, updatePastureReport: UpdatePastureReport) {
    const report = await this.PastureMgmtModel.findOne({ where: { id: id } });
    if (!report) throw new HttpException('Report doesnt exists', 400);

    const set = {
      ...updatePastureReport,
      satelliteSource: 'Santinel',
    };

    await this.PastureMgmtModel.update({ ...set }, { where: { id: id } });

    return { success: true };
  }

  remove(id: number, userId: number) {
    return `This action removes a #${id} pastureMgmt`;
  }
  checkInProgressReports = async (userId, t) => {
    const inProgressReportsCount = await this.PastureMgmtModel.count({
      where: { status: 'IN-PROGRESS', userId },
      transaction: t,
    });
    return inProgressReportsCount;
  };
  // Calculating center-latitude and center-longitude
  calculateCenteroiPolygon = async (coordinates) => {
    var x = coordinates.map(function (a) {
      return a['lat'];
    });
    var y = coordinates.map(function (a) {
      return a['log'];
    });
    console.log({ x }, { y });
    var minX = Math.min(...x);
    var maxX = Math.max(...x);
    var minY = Math.min(...y);
    var maxY = Math.max(...y);
    return [(minX + maxX) / 2, (minY + maxY) / 2];
  };

  //Check in report already exist on base of centroid
  checkExistingData = async (centroidPolygon, userId, dateOfInterest, t) => {
    try {
      var result = await this.PastureMgmtModel.findAll({
        include: [
          {
            model: this.PastureMgmtCoordModel,
            attributes: ['latitude', 'longitude'],
            as: 'coordinates',
            required: true,
          },
        ],
        where: {
          centerLatitude: centroidPolygon[0],
          centerLongitude: centroidPolygon[1],
          status: 'COMPLETED',
          userId: userId,
          dateOfInterest: dateOfInterest,
        },
        transaction: t,
      });
      if (isEmpty(result)) {
        result = await this.PastureMgmtModel.findAll({
          include: [
            {
              model: this.PastureMgmtCoordModel,
              attributes: ['latitude', 'longitude'],
              as: 'coordinates',
              required: true,
            },
          ],
          where: {
            centerLatitude: centroidPolygon[0],
            centerLongitude: centroidPolygon[1],
            status: 'COMPLETED',
            dateOfInterest: dateOfInterest,
          },
          transaction: t,
        });
        let record = {
          isSameUser: false,
          data: result,
        };
        if (isEmpty(result)) {
          record.data = null;
        }
        return record;
      }
      const record = {
        isSameUser: true,
        data: result,
      };
      return record;
    } catch (error) {
      console.log(error);
    }
  };

  //Composing Data for insertion
  composeDataForInserting = async (
    reportsData,
    userId,
    dateOfInterest,
    createdAt,
  ) => {
    let finalDataToInsert = [];
    for (const report of reportsData) {
      let data = {
        userId: userId,
        reportType: report.reportType,
        coordinates: report.coordinates,
        dateOfInterest: dateOfInterest,
        zoomLevel: report.zoomLevel,
        cropType: report.cropType,
        cropVariety: report.cropVariety,
        status: report.status,
        centerLatitude: report.centerLatitude,
        centerLongitude: report.centerLongitude,
        sowingDate: report.sowingDate,
        harvestingDate: report.harvestingDate,
        satelliteSource: report.satelliteSource,
        inputImage: report.inputImage,
        geoImagePath: report.geoImagePath,
        shortImagePath: report.shortImagePath,
        reportPDFPath: report.reportPDFPath,
        reportS3Key: report.reportS3Key,
        cropTypeName: report.cropTypeName,
        cropVarietyName: report.cropVarietyName,
        locationName: report.locationName,
        segment: report.segment,
        createdAt: createdAt,
      };

      finalDataToInsert.push(data);
    }
    return finalDataToInsert;
  };

  //inserting Existing record
  insertExistingData = async (data, t) => {
    try {
      for (const report of data) {
        let reportData = await this.PastureMgmtModel.create(report, {
          transaction: t,
        });
        const satelliteReportId = reportData.id;
        if (this.notEmpty(report.coordinates)) {
          const reportCoordinates = report.coordinates.map((data) => {
            const { lat, log } = data;
            return {
              satelliteReportId,
              latitude: lat,
              longitude: log,
            };
          });
          // insert data into the report coordinates
          await this.PastureMgmtCoordModel.bulkCreate(reportCoordinates, {
            transaction: t,
          });
        }
      }
      await t.commit();
      if (t.finished == 'commit') {
        return true;
      }
    } catch (error) {
      await t.rollback();
      return false;
    }
  };

  // Getting count and data of report types
  getReportTypesCountAndData = async (t) => {
    const reportTypes = await this.ReportTypesModel.findAndCountAll({
      attributes: ['id', 'name'],
      transaction: t,
    });
    const reportTypesData = {
      count: reportTypes.count,
      data: reportTypes.rows,
    };
    return reportTypesData;
  };

  // Send Message to SQS after insertion of record for starting backend process
  sendMsgToSQS = async (userId, currentDate) => {
    try {
      let repotrsData = await this.PastureMgmtModel.findAll({
        attributes: ['id'],
        where: {
          userId: userId,
          createdAt: currentDate,
          status: 'PENDING',
        },
        order: [['createdAt', 'DESC']],
      });

      // TODO : dynamic notification
      const msgTitle = 'Report is ready to download';
      const msgBody = 'You can download the report by clicking here';

      const notification_payload = JSON.stringify({
        title: msgTitle,
        body: msgBody,
        type: 'satelite_report',
      });

      //store in notification table
      // await CreateUserNotification(userId,notification_payload);

      let reportIdsArray = [];
      if (repotrsData != null) {
        for (const report of repotrsData) {
          reportIdsArray.push(report.id);
        }
      }
      let messageBodyToSend = {
        userID: userId,
        reportIds: reportIdsArray,
        source: 'livestock',
        redirectUrl: CONSTANT.LG_URL,
      };

      var params = {
        MessageBody: JSON.stringify(messageBodyToSend) /* required */,
        QueueUrl:
          process.env.AWS_QUEUE_URL ||
          'https://sqs.us-west-1.amazonaws.com/495454422438/dimitra-satellite-reports-queue-dev' /* required */,
        DelaySeconds: 10,
      };
      return new Promise((resolve, reject) => {
        sqs.sendMessage(params, function (err, data) {
          if (err) return reject(false);
          else return resolve(true);
        });
      });
    } catch (err) {
      return 'SQS error';
    }
  };

  notEmpty = (varValue) => {
    if (
      varValue != null &&
      typeof varValue != 'undefined' &&
      varValue.length > 0
    ) {
      return true;
    }
    return false;
  };

  // get signed url of the file REgion west
  getSignedURLs3West = async (action = 'getObject', params) => {
    try {
      var url = this.s3Service.s3.getSignedUrl(action, params);
      return url;
    } catch (err) {
      console.log('inside verify has function ********', err.message);
      return false;
    }
  };
}
