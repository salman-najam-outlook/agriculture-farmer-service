import {
    Controller,
    Headers,
    Get,
    Res,
    Query,
    Req,
} from "@nestjs/common";
import { Request } from "express";
import * as ejs from "ejs";
import * as puppeteer from "puppeteer";
import { join } from "path";
import { ExemptProductService } from "./services/exempt-product.service";
import { GetTokenData } from "src/decorators/get-token-data.decorator";
import { I18n, I18nContext } from "nestjs-i18n";
@Controller("api/exempt-products")
export class ExemptProductController {

    constructor(
        private readonly exemptProductService: ExemptProductService) {
    }

    @Get("pdf")
    async getGeneratePdf(
      @Res() res,
      @Req() req: Request,
      @GetTokenData("organizationid") organizationId: number,
      @I18n() i18n: I18nContext,
    ) {
      const lang = req.headers.lang ?? "en";
      const result = await this.exemptProductService.findAll(organizationId);
      const rs = result.map((x) => ({
        noOfFarms: 0, 
        productQuantity: 0,
        ...x.toJSON(),
      }));
    
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
    
      const html = await ejs.renderFile(
        join(__dirname, "../../../deforestation/view/dds", "exempt-products.ejs"),
        { report: rs ,
          t:i18n.t.bind(i18n),
          lang,  
        },
      
        { async: true }
      );
    
      // Set HTML content to Puppeteer page
      await page.setContent(html);
    
      // Generate the PDF with header and footer
      const pdfBuffer = await page.pdf({
        displayHeaderFooter: true,
        format: 'a4',
        timeout: 300000,
        footerTemplate: `<div style="width: 100%;">
          <div style="border-top: 1px solid #787878; margin-top:10px; font-size: 8px; line-height: 1; text-color: #000000; padding: 16px 12px; display: flex; align-items: flex-end; justify-content: space-between;">
            <div>Dimitra.io</div>
            <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
          </div>
        </div>`
    });
    
      await browser.close();
    
      // Set response headers and send the PDF buffer
      res.setHeader("Content-Disposition", "attachment; filename=document.pdf");
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfBuffer);
    }


}
