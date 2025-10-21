import {
    Controller,
    Headers,
    Get,
    Res,
    Req,
    NotFoundException,
    BadRequestException,
    Query,
} from "@nestjs/common";
import * as ejs from "ejs";
import * as puppeteer from "puppeteer";
import { join } from "path";
import { BlendService } from "../services/blends.service";
import { GetTokenData } from "src/decorators/get-token-data.decorator";
import { verify } from "jsonwebtoken";
import { I18n, I18nContext } from "nestjs-i18n";
import { Request } from 'express';
import * as moment from 'moment';

@Controller("api/blends")
export class BlendController {

    constructor(        
        private readonly blendService: BlendService) {
    }
    @Get("pdf")
    async getBlendsPDF(
        @Req() req: Request,
        @Query() queryP,
        @Res() res,
        @GetTokenData("organizationid") organizationId: number,
        @I18n() i18n: I18nContext,
    ) {
        try {
            const lang = req.headers.lang ?? "en";   
            const response = await this.blendService.listAllBlendsByOrgId(organizationId);
            const browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
    
            const PDFpage = await browser.newPage();
            let html = await ejs.renderFile(
              
                join(__dirname, "../../../../../src/deforestation/view/dds", "blends.ejs"),
                
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
    