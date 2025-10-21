import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UploadedFile,
  UseInterceptors,
  Logger,
  Headers,
  Get,
  RequestMethod,
  Param,
  Query
} from "@nestjs/common";
import { S3Service } from "src/upload/upload.service";
import { DownloadPdfInput, GetDeforestationInput } from "./dto/create-deforestation.input";
import { FileInterceptor } from "@nestjs/platform-express";
import * as puppeteer from "puppeteer";
import * as ejs from "ejs";
import { join } from "path";
import * as fs from "fs";
import { Request, Response } from "express";
import { DeforestationService } from "./deforestation.service";
import { I18n, I18nContext } from "nestjs-i18n";
import * as moment from "moment";
import { verify } from 'jsonwebtoken';
import { CONSTANT, KENYA_ROLES, URL } from "src/config/constant";
import { snakeCase } from 'lodash';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';
import { SolanaService } from 'src/solana/solana.service';
import { ConfigService } from '@nestjs/config';
import { INDONESIA_ROLES } from "src/config/constant";

require("dotenv").config();

@Controller("api/deforestation/")
export class DeforestationController {
  constructor(
    private readonly uploadService: S3Service,
    private readonly deforestationService: DeforestationService,
    private readonly solanaService: SolanaService,
    private readonly configService: ConfigService,
  ) {}

  @Post("/by-userid")
  async deforestationsByFarmId(
    @Req() req: Request,
    @Res() res: Response,
    @Body() getDeforestationInput: GetDeforestationInput,
    @I18n() i18n: I18nContext,
    @Headers() headers,
  ) {
    try {
      const decoded = verify(headers["oauth-token"], process.env.JWT_SECRET || 'hemantdimitraaccesstokensecret');
      let userId = decoded.data.userId
      console.log(decoded)
    
      let deforestationRes = await this.deforestationService.findAllByUserId(
        userId,
        getDeforestationInput,
        false,
        false,
        headers['lang'] ?? 'en',
      )

      return res.status(200).json({
        status: true,
        statusCode: 200,
        data: deforestationRes
      });
    } catch (err) {
      res.status(err.statusCode || 500).json({
        status: false,
        message: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  }

  // @Post("assessment/pdf-download")
  // async assessmentReport(
  //   @Req() req: Request,
  //   @Res() res: Response,
  //   @Body() pdfInput: DownloadPdfInput,
  //   @I18n() i18n: I18nContext,
  // ) {
  //   try {
  //     const lang = req.headers?.lang ?? "en";
  //     const userUnit = pdfInput.userUnit ? 
  //     (
  //       typeof pdfInput.userUnit === "string" ? 
  //         JSON.parse(pdfInput.userUnit)
  //         : pdfInput.userUnit
  //     ) : 
  //     { abbvr: "ac", name: "Acre" };

  //     const reportDetails = await this.deforestationService.findOne(
  //       Number(pdfInput.id),
  //       userUnit
  //     );

  //     if (!reportDetails) {
  //       throw new Error("Report not found!");
  //     }

  //     const coordinates = JSON.stringify(reportDetails.coordinates);
  //     const logo = fs.readFileSync(
  //       join(__dirname, "image", "dimitra-compliance-logo.png"),
  //       {
  //         encoding: "base64",
  //       }
  //     );

  //     const html = await ejs.renderFile(
  //       join(__dirname, "view", "assessment.ejs"),
  //       {
  //         logo,
  //         lang,
  //         report: reportDetails,
  //         unit: userUnit,
  //         coordinates,
  //         t: i18n.t.bind(i18n),
  //       },
  //       { async: true }
  //     );

  //     const browser = await puppeteer.launch({
  //       args: ["--no-sandbox", "--disable-setuid-sandbox"],
  //     });
  //     const page = await browser.newPage();
  //     await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');

  //     page
  //       .on('console', message => Logger.log(`${message.type().toUpperCase()} ${message.text()}`))
  //       .on('pageerror', ({ message }) => Logger.log(message));

  //     await page.setContent(html);
  //     await page.waitForSelector("#map", { visible: true, timeout: 100000 });
  //     await page.waitForFunction(() => {
  //       const image = document.querySelector("#map img") as HTMLImageElement;
  //       return image.complete;
  //     });
  //     await page.waitForSelector('#deforestationImgOverlay', { visible: true, timeout: 40000 });


  //     const pdfBuffer = await page.pdf({
  //       format: "a4",
  //     });

  //     const s3Response = await this.uploadService.s3_upload(
  //       pdfBuffer,
  //       process.env.AWS_DEFORESTION_COMPLIANCE_REPORT_BUCKET,
  //       `forest-assessment-${new Date().getTime()}`,
  //       "application/pdf",
  //       true
  //     );

  //     return res.status(200).json({
  //       status: true,
  //       statusCode: 200,
  //       data: { location: s3Response.Location, key: s3Response.Key },
  //     });
  //   } catch (err) {
  //     res.status(err.statusCode || 500).json({
  //       status: false,
  //       message: err.message,
  //       statusCode: err.statusCode || 500,
  //     });
  //   }
  // }
  @Post("assessment/pdf-download")
  @UseInterceptors(FileInterceptor("file"))
  async assessmentReport1(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body,
    @I18n() i18n: I18nContext,
    @UploadedFile() file?: Express.Multer.File
  ) {
    try {
      console.log("-----Start downloading -------------------")
      const currentRole = body?.roles ? body?.roles.split(',') : []
      const isPtsiUser = INDONESIA_ROLES.some(role => currentRole.includes(role));
      const isKenyaUser = KENYA_ROLES.some(role => currentRole.includes(role));

      const lang = req.headers?.lang ?? "en";
      const mapBase64Img = Buffer.from(file.buffer).toString("base64");
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      let userUnit = body.userUnit ? (typeof body.userUnit === "string" ? JSON.parse(body.userUnit) : body.userUnit ): { abbvr: "ac", name: "Acre" };
      userUnit = Object.keys(userUnit).length == 0 ? { abbvr: "ac", name: "Acre" }: userUnit
      
      // Read the image file as base64
      const logoName = isPtsiUser ? "ptsi_logo.webp" : isKenyaUser ? "naccu_logo.png" : "dimitra-compliance-logo.png";
      const logo = fs.readFileSync(
        join(__dirname, "image", logoName),
        {
          encoding: "base64",
        }
      );

      const reportDetails = await this.deforestationService.findOne(
        Number(body.id),
        userUnit
      );

      if (!reportDetails) {
        throw new Error("Report not found!");
      }
      const coordinates = JSON.stringify(reportDetails.coordinates);
      //area unit conversion
      if(userUnit.factor) {
        reportDetails.highProb = reportDetails.highProb / userUnit.factor
        reportDetails.lowProb = reportDetails.lowProb / userUnit.factor
        reportDetails.zeroProb = reportDetails.zeroProb / userUnit.factor
        reportDetails.mediumProb = reportDetails.mediumProb / userUnit.factor
        reportDetails.veryHighProb = reportDetails.veryHighProb / userUnit.factor
        reportDetails.veryLowProb = reportDetails.veryLowProb / userUnit.factor
        reportDetails.totalArea = reportDetails.totalArea / userUnit.factor
      }
          
      let html;
      if(body.platform === "web"){
        const viewPath = isPtsiUser ? "assessment-web-ptsi.ejs" : isKenyaUser ? "assessment-web-naccu.ejs" : "assessment-web.ejs"
        html = await ejs.renderFile(
          join(__dirname, "view", viewPath),
          {
            logo,
            lang,
            mapBase64Img,
            report: reportDetails,
            unit: userUnit,
            coordinates,
            t: i18n.t.bind(i18n),
            snakeCase,
          },
          { async: true }
        );
      } else {
        html = await ejs.renderFile(
          join(__dirname, "view", "assessment.ejs"),
          {
            logo,
            lang,
            mapBase64Img,
            report: reportDetails,
            unit: userUnit,
            coordinates,
            t: i18n.t.bind(i18n),
            snakeCase,
          },
          { async: true }
        );
      }

      // Set the HTML content of the page
      await page.setContent(html);

      // Generate the PDF
      const pdfBuffer = await page.pdf({
        format: "tabloid",
      });

      const s3Response = await this.uploadService.s3_upload(
        pdfBuffer,
        process.env.AWS_DEFORESTION_COMPLIANCE_REPORT_BUCKET,
        `${snakeCase(reportDetails.farmName)}_${moment().format('YYYY-MM-DD')}_${moment.now()}`,
        "application/pdf",
        true
      );

      console.log("S3 Response:", 'S3 Buffer hits ---------------------------------------');

      // return await this.pastureService.update(id, updatePastureReport);
      res.status(200).json({
        status: true,
        statusCode: 200,
        data: { location: s3Response.Location, key: s3Response.Key },
      });
    } catch (err) {
      console.log("-----Catch statement hits .......... -------------------")
      res.status(err.statusCode || 500).json({
        status: false,
        message: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  }

  @Post("compliance/pdf-download")
  @UseInterceptors(FileInterceptor("file"))
  async complianceReport(
    @Req() req: Request,
    @Res() res: Response,
    @Body() pdfInput: DownloadPdfInput,
    @I18n() i18n: I18nContext,
    @UploadedFile() file?: Express.Multer.File
  ) {
    try {
      const currentRole = pdfInput?.roles ? pdfInput?.roles.split(',') : []
      const isPtsiUser = INDONESIA_ROLES.some(role => currentRole.includes(role));
      const isKenyaUser = KENYA_ROLES.some(role => currentRole.includes(role));

      const lang = req.headers?.lang ?? "en";
      const mapBase64Img = Buffer.from(file.buffer).toString("base64");
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();

      let userUnit = pdfInput.userUnit ? (typeof pdfInput.userUnit === "string" ? JSON.parse(pdfInput.userUnit) : pdfInput.userUnit ): { abbvr: "ac", name: "Acre" };
      userUnit = Object.keys(userUnit).length == 0? { abbvr: "ac", name: "Acre" }: userUnit
      
      // Read the image file as base64
      const logo = fs.readFileSync(
        join(__dirname, "image", "dimitra-logo.png"),
        {
          encoding: "base64",
        }
      );

      const logoFile = isPtsiUser ? "ptsi_logo.webp" : isKenyaUser ? "naccu_logo.png" : "dimitra-green-logo.png";
      const greenLogo = fs.readFileSync(
        join(__dirname, "image", logoFile),
        { encoding: "base64" }
      );

      const complianceLogo = fs.readFileSync(
        join(__dirname, "image", "dimitra-compliance-logo.png"),
        {
          encoding: "base64",
        }
      );

      const backgroundFrame = fs.readFileSync(
        join(__dirname, "image", "frame.png"),
        {
          encoding: "base64",
        }
      );

      const horizontalArrow = fs.readFileSync(
        join(__dirname, "image", "horizontal-arrow.png"),
        {
          encoding: "base64",
        }
      );

      const verticalArrow = fs.readFileSync(
        join(__dirname, "image", "vertical-arrow.png"),
        {
          encoding: "base64",
        }
      );

      const reportDetails = await this.deforestationService.findOne(
        Number(pdfInput.id),
        userUnit
      );

      if (!reportDetails) {
        throw new Error("Report not found!");
      }

      //area unit conversion
      if(userUnit.factor) {
        reportDetails.highProb = reportDetails.highProb /userUnit.factor
        reportDetails.lowProb = reportDetails.lowProb /userUnit.factor
        reportDetails.zeroProb = reportDetails.zeroProb /userUnit.factor
        reportDetails.mediumProb = reportDetails.mediumProb /userUnit.factor
        reportDetails.veryHighProb = reportDetails.veryHighProb /userUnit.factor
        reportDetails.veryLowProb = reportDetails.veryLowProb /userUnit.factor
        reportDetails.totalArea = reportDetails.totalArea /userUnit.factor
      }
      
      
      
      let html = await ejs.renderFile(
        join(__dirname, "view", "compliance.ejs"),
        {
          logo,
          complianceLogo,
          backgroundFrame,
          horizontalArrow,
          verticalArrow,
          mapBase64Img,
          reportDetails,
          t: i18n.t.bind(i18n),
          lang,
          moment: moment,
          userUnit,
          snakeCase,
        },
        { async: true }
      );

      const isWeb = pdfInput.platform === 'web';

      if(isWeb){
        const ptsiview = isPtsiUser ? "compliance-web-ptsi.ejs" : isKenyaUser ? "compliance-web-naccu.ejs" : "compliance-web.ejs";
        html = await ejs.renderFile(
          join(__dirname, "view", ptsiview),
          {
            greenLogo,
            mapBase64Img,
            reportDetails,
            t: i18n.t.bind(i18n),
            lang,
            moment: moment,
            userUnit,
            snakeCase,
          },
          { async: true }
        );
      }

      // Set the HTML content of the page
      await page.setContent(html);

      // Generate the PDF
      const pdfBuffer = await page.pdf({
        displayHeaderFooter: isWeb,
        omitBackground: isWeb,
        footerTemplate: isWeb ? `
          <div style="width: 100%;">
            <div style="border-top: 1px solid #787878; font-size: 8px; line-height: 1; text-color: #000000; padding: 16px 12px; display: flex; align-items: center; justify-content: space-between;">
              <div>Dimitra.io</div>
              <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
            </div>
          </div>
        ` : undefined,
        format: isWeb ? 'a4' : 'tabloid',
        margin: isWeb ? {
          bottom: '80px',
        } : undefined,
      });

      const s3Response = await this.uploadService.s3_upload(
        pdfBuffer,
        process.env.AWS_DEFORESTION_COMPLIANCE_REPORT_BUCKET,
        `${snakeCase(reportDetails.farmName)}_${moment().format('YYYY-MM-DD')}_${moment.now()}`,
        "application/pdf",
        true
      );

      // return await this.pastureService.update(id, updatePastureReport);
      return res.status(200).json({
        status: true,
        statusCode: 200,
        data: { location: s3Response.Location, key: s3Response.Key },
      });
    } catch (err) {
      res.status(err.statusCode || 500).json({
        status: false,
        message: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  }

  @Get("/get-regions")
  async getRegions(
    @Req() req: Request,
    @Res() res: Response,
    @Body() getDeforestationInput: GetDeforestationInput,
    @I18n() i18n: I18nContext,
    @Headers() headers,
  ) {
    try {
      let results: any ={}
      results = await this.deforestationService.getRegions()
      return res.status(200).json({
        status: true,
        statusCode: 200,
        data: results.data
      });
    } catch (err) {
      res.status(err.statusCode || 500).json({
        status: false,
        message: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  }

  @Get("/deforestation-by-farmid/:farmId")
  async getDeforestationDetailByFarmId(@Param('farmId') farmId: number, @Res() res: Response) {
    try {
       const data = await this.deforestationService.deforestationByFarmId(farmId);
       return res.status(200).json({
        status: true,
        statusCode: 200,
        data: data
      });;
    } catch (err) {
      res.status(err.statusCode || 500).json({
        status: false,
        message: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  }
  @Post("/bulk-report")
  async getBulkUpload(
    @Req() req: Request,
    @Res() res: Response,
    @Body() input: [GetDeforestationInput],
    @I18n() i18n: I18nContext,
    @Headers() headers,
  ) {
    try {
      let results: any ={}
      results = await this.deforestationService.getBulkDeforestation(input)
      return res.status(200).json({
        status: true,
        statusCode: 200,
        message: results.data?.message || "Successfully generated EUDR deforestation status.",
        data: results.data?.data || []
      });
    } catch (err) {
      res.status(err.statusCode || 500).json({
        status: false,
        message: err.message || "Error getting deforestation status",
        statusCode: err.statusCode || 500,
      });
    }
  }
/**
 * 
 * @param body 
 * @param res 
 * @returns 
 * THIS is hits from python desd
 */
  @Post('/eudr-update-status')
  async handleEUDRStatusCallBack(@Body() body: any, @Res() res: Response){
    try {
      Logger.log("callback api for eudr status");
      await this.deforestationService.updateJobForDeforestationCallback(body.request_id);
      //await this.deforestationService.processAndReCalculateTolleranne(586)
      return res.status(200).json({
        status: false,
        message: "Generating output for deforestation detection",
      });

    } catch (error) {
      res.status(error.statusCode || 500).json({
        status: false,
        message: error.message || "Failed to process callback",
      });
    }
  }


  @Post("/bulk-report/diligence-reports/:id")
  async getBulkUploadByDiligenceReportId(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
    @GetTokenData("organizationid") organizationId: number,
  ) {
    try {
      const lang = typeof req.headers?.lang === 'string' ? req.headers.lang : "en";
      const job = await this.deforestationService.createJobForDiligenceDeforestationReport(id, organizationId, lang);
      return res.status(200).json({
        status: true,
        statusCode: 200,
        message: 'Analyzing deforestation for farms',
        data: job,
        success: true,
      });
    } catch (err) {
      console.error(err);
      res.status(err.statusCode || 500).json({
        status: false,
        message: err.message || "Error getting deforestation status",
        statusCode: err.statusCode || 500,
        success: false,
      });
    }
  }

  @Get('/bulk-report/:requestId/status')
  async getBulkUploadRequestStatus(
    @Param('requestId') requestId: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.deforestationService.getBulkUploadRequestStatusById(requestId);
      return res.json({
        success: result.success,
        data: result.data,
      });
    } catch (error) {
      console.error(error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error getting bulk report request status',
      });
    }
  }

  @Post('/solana/bulk-imports')
  @UseInterceptors(FileInterceptor("file", {
    fileFilter(_req, file, callback) {
        if(file.mimetype !== 'application/json' && file.originalname.split('.').pop() !== 'json') {
          return callback(new Error('Only JSON files are allowed'), false);
        }
        callback(null, true);
    },
  }))
  async writeBulkDataToSolana(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
    @Headers('secret-key') headerSecretKey: string | undefined,
  ) {
    try {
      const secretKey = this.solanaService.getEncodedSecretKey();
      const adminSecretKey = this.configService.get<string>('ADMIN_SECRET_KEY');
      if(!secretKey && !adminSecretKey) {
        return res.status(500).json({
          success: false,
          message: 'Solana secret key for admin is not configured.',
        });
      }

      if(!headerSecretKey) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access. Add secret-key header to the request.',
        });
      }
      if (headerSecretKey !== secretKey && headerSecretKey !== adminSecretKey) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access. Mismatch in secret-key.',
        });
      }

      const response = await this.solanaService.addDeforestationTransactionFromFile(file);
      if(response.success) {
        return res.status(200).json({
          success: true,
          message: 'Deforestation data successfully added to queue for processing.',
        });
      }

      return res.status(500).json({
        success: false,
        message: response.error || 'Failed to add deforestation data to queue.',
      });
    } catch (error) {
      console.error('Error in writeBulkDataToSolana:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while processing the request.',
      })
    }
  }

  @Get('/write-all-missing-solana-transaction')
  async writeMissingSolanaTransaction(
    @Res() res: Response
  ) {
    try {
      const result = await this.deforestationService.writeAllMissingSolanaTransaction();
      return res.status(200).json({
        success: true,
        message: 'Successfully updated missing solana transactions for deforestation reports.',
        data: result,
      });
    } catch (error) {
      console.error('Error in writeMissingSolanaTransaction:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while updating missing solana transactions for deforestation reports.',
      });
    }
  }

  @Get('/solana-analytics')
  async getSolanaAnalytics(
    @Res() res: Response,
  ) {
    try {
      const result = await this.solanaService.getAnalyticsOfTransactableTypeByContinent('deforestation');
      return res.status(200).json({
        success: true,
        message: 'Successfully fetched solana analytics for deforestation reports.',
        data: result,
      });
    } catch (error) {
      console.error('Error in getSolanaAnalytics:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while fetching solana analytics for deforestation reports.',
      });
    }
  }
}
