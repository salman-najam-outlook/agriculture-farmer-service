
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Body,
  Headers,
  Get,
  Res,
  Query,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BulkUploadService } from '../services/bulkUpload.service';
import * as multer from 'multer';
import * as ejs from "ejs";
import * as puppeteer from "puppeteer";
import { join } from "path";
import { BlendSettingsService } from "../services/blend.service";
import { GetTokenData } from "src/decorators/get-token-data.decorator";
import * as moment from 'moment';
import { I18n, I18nContext } from "nestjs-i18n";
import { Request } from 'express';


const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

@Controller('api/admin/blends')
export class BulkUploadController {
  constructor(private readonly bulkUploadService: BulkUploadService) {}

  @Post('bulk-upload')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async bulkUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body('organizationId') organizationId: number,
    @Body('userId') userId: number,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }
    return this.bulkUploadService.processFile(file, {organizationId, userId});
  }
}


@Controller("api/blend-settings")
export class BlendSettingsPdfController {

    constructor(
        private readonly blendSettingService: BlendSettingsService) {
    }
    @Get("pdf")
    async getBlendSettingsPdf(
        @Req() req: Request,
        @Res() res,
        @GetTokenData("organizationid") organizationId: number,
        @I18n() i18n: I18nContext,
    ) {

        try {
        const lang = req.headers.lang ?? "en";   
        const response = await this.blendSettingService.findAllResponse( organizationId)
   

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const PDFpage = await browser.newPage();
        let html = await ejs.renderFile(
          
            join(__dirname, "../../../../../../src/deforestation/view/dds", "blend-settings.ejs"),
            
            {
               report:response,
               t:i18n.t.bind(i18n),
               lang,
               moment,
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
        //res.send({response})
        res.setHeader('Content-Disposition', 'attachment; filename=document.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);
    }
    catch (error) {
        console.log(error)
        throw new NotFoundException("No data found");
  }
}
}
