import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  BadRequestException,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Render,
  ParseIntPipe
} from "@nestjs/common";
import { ProductionPlaceService } from "./production-place.service";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { verify } from "jsonwebtoken";
import * as path from "path";
import * as fs from "fs";
import { S3Service } from "src/upload/upload.service";
import { DiligenceReport } from 'src/diligence-report/entities/diligence-report.entity';
import { InjectModel } from '@nestjs/sequelize';
import { UserDDS } from 'src/users/entities/dds_user.entity';
import {Farm} from "src/farms/entities/farm.entity";
import {DueDiligenceProductionPlace} from "./entities/production-place.entity";
import * as ejs from "ejs";
import * as puppeteer from "puppeteer";
import { join } from "path";
import {Geofence} from "src/geofence/entities/geofence.entity";
import {GeofenceCoordinates} from "src/geofence/entities/geofenceCoordinates.entity";
import { FarmCoordinates } from 'src/farms/entities/farmCoordinates.entity';
import { ApiCallHelper,withRetry } from 'src/helpers/api-call.helper';
import { URL,CONSTANT } from 'src/config/constant';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';
import { RequestMethod } from 'src/helpers/helper.interfaces';
import { ProductionPlaceWarningService } from "src/due-diligence/production-place/production-place-warning.service"
import axios from 'axios';
import { S3Service as s3Service} from '../blend/blend-settings/utils/s3upload';

const AWS = require("aws-sdk");
@Controller("api/production-place")
export class ProductionPlaceController {
  constructor(
    private readonly uploadService: S3Service,
    private readonly s3Service: s3Service,
    private readonly productionPlaceService: ProductionPlaceService,
    private apiCallHelper: ApiCallHelper,
    private productionPlaceWarningService:ProductionPlaceWarningService, 
    @InjectModel(DiligenceReport) private readonly diligenceReportModel: typeof DiligenceReport,
    @InjectModel(DueDiligenceProductionPlace)private productionPlaceModel : typeof DueDiligenceProductionPlace,
    @InjectModel(UserDDS) private UserModel: typeof UserDDS,
  ) { }

  @Post("import")
  @UseInterceptors(FilesInterceptor("files"))
  async uploadProductionPlaces(
    @Query("dueDiligenceReportId") dueDiligenceReportId: any,
    @Body("sourceType") sourceType: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Headers() headers
  ) {
    const diligenceReport = await this.diligenceReportModel.findOne({
      where: {
        id: dueDiligenceReportId
      },
    });

    if (!diligenceReport) {
      throw new NotFoundException("Diligence Report not found.");
    }
    diligenceReport.is_dds_status_update = false;
    await diligenceReport.save();

    const decoded = verify(
      headers["oauth-token"],
      process.env.JWT_SECRET || "hemantdimitraaccesstokensecret"
    );
    let userId = decoded.data.userId;
    const ddsUser = await this.UserModel.findOne({ where: { cf_userid: userId } })

    const token = headers["oauth-token"];
    if (!files || files.length === 0) {
      throw new NotFoundException("No files uploaded.");
    }
    // only support geojson for now for multi-upload
    const fileExtensions = files.map(f => path.extname(f.originalname).toLowerCase());
    if (!fileExtensions.every(ext => ext === '.geojson')) {
      throw new Error('All files must be .geojson for multi-upload.');
    }
    return await this.productionPlaceService.processGeoJsonFile(
      diligenceReport,
      files,
      userId,
      ddsUser,
      token
    );
  }

  @Get("geoJsons")
  async getGeoJson(
    @GetTokenData("authorization") authorization: string,
    @GetTokenData("organizationid") organizationId: number,
    @Param() params:any,
    @Res() res,
    @Req()req
  ) {
    const { farm_id } = req.query;
    try {
      if(farm_id === 'all') {
        const s3 = new AWS.S3({
          accessKeyId: process.env.GEO_JSON_ID,
          secretAccessKey: process.env.GEO_JSON_BUCKET_KEY
        })
        const productionPlace = await this.productionPlaceModel.findAll({
          where: {
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
                      model: UserDDS,
                      as: "userDdsAssoc",
                      required: true,
                      where: {
                        organization: organizationId
                      }
                  },
              ]
          }, 
          ]
        })
        let farmIds = productionPlace.map(({ farm }) => farm.id);
        res.status(200).json({
          message: 'Your file is currently being processed!'
        })
        let obj = await this.productionPlaceService.generateGeoJson(farmIds);
        const fileName = 'farm_'+Date.now()+'.geojson';
        const filePath = path.join(__dirname, fileName);
        fs.writeFileSync(filePath, JSON.stringify(obj));
        const fileContent = fs.readFileSync(filePath);
    
        // uploading to s3
        const params = {
          Bucket: process.env.GEO_JSON_BUCKET,
          Key: fileName,
          Body: fileContent,
          ContentType: 'application/geo+json'
        };
        const s3Data = await s3.upload(params).promise();
        const endpoint = URL.CF_BASEURL + '/admin/notification/geojsons';
        const {data} = await this.apiCallHelper.call(
          RequestMethod.GET,
          endpoint,
          {
            "oauth-token": authorization
          },
          {
            data: s3Data.Location,
          }
        )
        return;
      }
      const farmIds = farm_id.split(',');
      let obj = await this.productionPlaceService.generateGeoJson(farmIds);
      const filePath = path.join(__dirname, 'allFarm.geojson');
    
      fs.writeFileSync(filePath, JSON.stringify(obj));
      res.download(filePath, 'allFarm.geojson', (err) => {
          if (err) {
              console.error('Error downloading the file:', err);
          } else {
              console.log('File downloaded successfully');
          }
      });
    }catch (err) {
      console.log(err)
    }
  }

  @Get("dispute-pdf")
  async getGenerateShipmentPdf(
      @Query() queryP,
      @Headers() headers,
      @Res() res
  ) {
      const {
          page,
          limit,
          search, 
          disputeIds
      } = queryP

      const serviceParam = {
          page:page?Number(page):null,
          limit:limit ? Number(limit) : null,
          searchPhrase:search,
          disputeIds: disputeIds.split(',')
      }
      
      let organization;
      try {
          const decoded = verify(
              headers["oauth-token"],
              process.env.JWT_SECRET || "hemantdimitraaccesstokensecret"
          );
          let userId = decoded.data.userId;
          const user = await this.UserModel.findOne({
              where: {
                  cf_userid: userId
              }
          })
          organization = user.organization ?? null
      } catch (HttpException) {
          throw new BadRequestException('Token or user missmatch.')
      }
      if (!organization) {
          throw new NotFoundException("Could not download a file");
      }
      const response = await this.productionPlaceService.findProductionPlaceDisputes(serviceParam, organization)
    
      const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const PDFpage = await browser.newPage();

      let html = await ejs.renderFile(
          join(__dirname,  "../../deforestation/view/dds", "dispute-resolution.ejs"),
          {
             report:response
          },
          { async: true }
        );

      await PDFpage.setContent(html);

      const pdfBuffer = await PDFpage.pdf({
          displayHeaderFooter:true,
          format: 'a4',
          footerTemplate:`<div style="width: 100%;">
              <div style="border-top: 1px solid #787878; margin-top:10px; font-size: 8px; line-height: 1; text-color: #000000; padding: 16px 12px; display: flex; align-items: flex-end; justify-content: space-between;">
                <div>Dimitra.io</div>
                <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
              </div>
            </div>`
        });

      await browser.close();
      res.setHeader('Content-Disposition', 'attachment; filename=document.pdf');
      res.setHeader('Content-Type', 'application/pdf')
      res.send(pdfBuffer);
  }


  @Get("production-place-without-status-pdf")
  async getProductionPlacePDFWithoutStatus(
      // @Body('payload') body:any,
      @Query() query,
      @Headers() headers,
      @Res() res
  ) {
      let organization;
      try {
          const decoded = verify(
              headers["oauth-token"],
              process.env.JWT_SECRET || "hemantdimitraaccesstokensecret"
          );
          let userId = decoded.data.userId;
          const user = await this.UserModel.findOne({
              where: {
                  cf_userid: userId
              }
          })
          organization = user.organization ?? null
      } catch (HttpException) {
          throw new BadRequestException('Token or user missmatch.')
      }
      if (!organization) {
          throw new NotFoundException("Could not download a file");
      }

      const {
         page,
         limit,
         diligenceReportId,
         orgId,
         removed,
         farmCountry,
         farmOwner,
         eudrDeforestationStatus,
         riskAssessmentStatus,
         searchPhrase,
         supplierId,
         internalRefNum,
         filterByDateOfRegister,
         filterByDateOfLastReport,
         isRegionalRiskAssement
      } = query

      const filter= { 
        page:Number(page) || null,
        limit:Number(limit) || null,
        diligenceReportId:Number(diligenceReportId) ||null,
        orgId:Number(orgId)|| null,
        removed,
        farmCountry,
        farmOwner,
        eudrDeforestationStatus,
        riskAssessmentStatus,
        searchPhrase,
        supplierId:Number(supplierId) || null,
        internalRefNum,
        filterByDateOfRegister,
        filterByDateOfLastReport,
        isRegionalRiskAssement,
      }
     
      const response = await  this.productionPlaceService.findAll(filter, organization)

      const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const PDFpage = await browser.newPage();
      

      let html = await ejs.renderFile(
          join(__dirname,  "../../deforestation/view/dds", "production-places.ejs"),
          {
             report:response.rows,
             isRegionalRiskAssement
          },
          { async: true }
        );

      await PDFpage.setContent(html);

      const pdfBuffer = await PDFpage.pdf({
          displayHeaderFooter:true,
          format: 'a4',
          footerTemplate:`<div style="width: 100%;">
              <div style="border-top: 1px solid #787878; margin-top:10px; font-size: 8px; line-height: 1; text-color: #000000; padding: 16px 12px; display: flex; align-items: flex-end; justify-content: space-between;">
                <div>Dimitra.io</div>
                <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
              </div>
            </div>`
        });

      await browser.close();
      res.setHeader('Content-Disposition', 'attachment; filename=document.pdf');
      res.setHeader('Content-Type','application/pdf')
      res.send(pdfBuffer);
  }


  @Get("production-place-with-status-pdf")
  async getProductionPlacePDFWithStatus(
      // @Body('payload') body:any,
      @Query() query,
      @Headers() headers,
      @Res() res
  ) {
      let organization;
      try {
          const decoded = verify(
              headers["oauth-token"],
              process.env.JWT_SECRET || "hemantdimitraaccesstokensecret"
          );
          let userId = decoded.data.userId;
          const user = await this.UserModel.findOne({
              where: {
                  cf_userid: userId
              }
          })
          organization = user.organization ?? null
      } catch (HttpException) {
          throw new BadRequestException('Token or user missmatch.')
      }
      if (!organization) {
          throw new NotFoundException("Could not download a file");
      }

      const {
         page,
         limit,
         diligenceReportId,
         orgId,
         removed,
         farmCountry,
         farmOwner,
         eudrDeforestationStatus,
         riskAssessmentStatus,
         searchPhrase,
         supplierId,
         internalRefNum,
         filterByDateOfRegister,
         filterByDateOfLastReport
      } = query

      const filter= { 
        page:Number(page) || null,
        limit:Number(limit) || null,
        diligenceReportId:Number(diligenceReportId) ||null,
        orgId:Number(orgId)|| null,
        removed,
        farmCountry,
        farmOwner,
        eudrDeforestationStatus,
        riskAssessmentStatus,
        searchPhrase,
        supplierId:Number(supplierId) || null,
        internalRefNum,
        filterByDateOfRegister,
        filterByDateOfLastReport
      }
     
      const response = await  this.productionPlaceService.findAll(filter, organization)

      const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const PDFpage = await browser.newPage();
      

      let html = await ejs.renderFile(
          join(__dirname,  "../../deforestation/view/dds", "production-place-with-status.ejs"),
          {
             report:response.rows
          },
          { async: true }
        );

      await PDFpage.setContent(html);

      const pdfBuffer = await PDFpage.pdf({
          displayHeaderFooter:true,
          format: 'a4',
          footerTemplate:`<div style="width: 100%;">
              <div style="border-top: 1px solid #787878; margin-top:10px; font-size: 8px; line-height: 1; text-color: #000000; padding: 16px 12px; display: flex; align-items: flex-end; justify-content: space-between;">
                <div>Dimitra.io</div>
                <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
              </div>
            </div>`
        });

      await browser.close();
      res.setHeader('Content-Disposition', 'attachment; filename=document.pdf');
      res.setHeader('Content-Type','application/pdf')
      res.send(pdfBuffer);
  }

  @Post("update-disregard-status")
  async updateDisregardStatusForAssessmentProductionPlace(
    @Body('dueDiligenceReportId') dueDiligenceReportId: number,
    @Body('dueDiligenceReportId') assessmentId: number,
  ): Promise<{success: boolean, message: string}> {
    return await this.productionPlaceService.updateDisregardStatus(dueDiligenceReportId, assessmentId);
  }

  @Get("dds-farms")
  async getFarmsByOrganization(
    @Headers() headers,
    @Query()  query,
    @Res() res
  ) {
    const { page = 1, limit = 20, search = '' } = query
    try {
      const endpoint = `${URL.CF_BASEURL}/admin/farm/dds/farms?page=${page}&limit=${limit}&search=${search}`;
      const response = await this.apiCallHelper.call(RequestMethod.GET, endpoint, {
        "content-type": "application/json",
        "oauth-token":  headers["oauth-token"],
      },{});
     res.status(200).json({
       data:response.data
     });
    } catch (err) {
      throw new BadRequestException("No data fetch  from cf,cc");
    }
  }
  @Post("dds-fmi")
  async getWarningForFarmCoordinate(
    @Headers() headers,
    @Query()  query,
    @Res() res,
    @Body() body
  ){
    const lang = headers.lang ||  'en'
    const {farms} = body
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
          items:farms
        },
      })
    );
    res.status(200).json({data:response.data});
  }

  @Get("diligence-report-complaint/:reportId")
    async getDiligenceComplaint(
        @Res() res,
        @Req() req,
        @Param('reportId', ParseIntPipe) reportId: number,
        @Query() query,
        
    ){
        //const ids = [125882,125881,125880,125879,125878,125877];
        const getResults = await this.productionPlaceWarningService.concludeReportNonComplaint(reportId) 
        //const jobs = await this.dueDiligenceService.processAndStoreProductionPlaceWarning('job')
        res.json({ getResults })
    }

  @Post("import-csv")
  @UseInterceptors(FilesInterceptor("files"))
  async importCsvFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Query("dueDiligenceReportId") dueDiligenceReportId: any,
    @Headers() headers
  ) {
    if (!dueDiligenceReportId) {
      throw new BadRequestException("dueDiligenceReportId is required.");
    }
    const diligenceReport = await this.diligenceReportModel.findOne({
      where: { id: dueDiligenceReportId },
    });
    if (!diligenceReport) {
      throw new NotFoundException("Diligence Report not found.");
    }
    const decoded = verify(
      headers["oauth-token"],
      process.env.JWT_SECRET || "hemantdimitraaccesstokensecret"
    );
    let userId = decoded.data.userId;
    const ddsUser = await this.UserModel.findOne({ where: { cf_userid: userId } });
    const token = headers["oauth-token"];
    if (!files || files.length === 0) {
      throw new BadRequestException("No files uploaded.");
    }
    await this.productionPlaceService.processCsvFiles(
      files,
      diligenceReport,
      userId,
      ddsUser,
      token
    );  
    return { success: true, message: "CSV files processed." };
  }

  @Post("import-excel")
  @UseInterceptors(FilesInterceptor("files"))
  async importExcelFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Query("dueDiligenceReportId") dueDiligenceReportId: any,
    @Headers() headers
  ) {
    if (!dueDiligenceReportId) {
      throw new BadRequestException("dueDiligenceReportId is required.");
    }
    const diligenceReport = await this.diligenceReportModel.findOne({
      where: { id: dueDiligenceReportId },
    });
    if (!diligenceReport) {
      throw new NotFoundException("Diligence Report not found.");
    }
    const decoded = verify(
      headers["oauth-token"],
      process.env.JWT_SECRET || "hemantdimitraaccesstokensecret"
    );
    let userId = decoded.data.userId;
    const ddsUser = await this.UserModel.findOne({ where: { cf_userid: userId } });
    const token = headers["oauth-token"];
    if (!files || files.length === 0) {
      throw new BadRequestException("No files uploaded.");
    }
    await this.productionPlaceService.processExcelFiles(
      files,
      diligenceReport,
      userId,
      ddsUser,
      token
    );  
    return { success: true, message: "Excel files processed." };
  }
}