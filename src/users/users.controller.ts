import {
    Body,
    Controller,
    Headers,
    NotFoundException,
    BadRequestException,
    Get,
    Res,
    Query,
    Req,
    Post,
    Render,
} from "@nestjs/common";
import { Request } from "express";
import { verify } from "jsonwebtoken";
import { InjectModel } from '@nestjs/sequelize';
import { UserDDS as User } from "src/users/entities/dds_user.entity";
import * as ejs from "ejs";
import * as puppeteer from "puppeteer";
import { join } from "path";

@Controller("api/users")
export class UserController {

    constructor(
        @InjectModel(User) private UserModel: typeof User
    ) { }

    @Post("supplier-pdf")
    async getGenerateSuppliers(
        @Body('payload') body: any,
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

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const PDFpage = await browser.newPage();


        let html = await ejs.renderFile(
            join(__dirname, "../deforestation/view/dds", "suppliers.ejs"),
            {
                report: body
            },
            { async: true }
        );

        await PDFpage.setContent(html);

        const pdfBuffer = await PDFpage.pdf({
            displayHeaderFooter: true,
            format: 'a4',
            footerTemplate: `<div style="width: 100%;">
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

    @Post("operator-pdf")
    async getOperatorPdf(
        @Body('payload') body: any,
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

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const PDFpage = await browser.newPage();


        let html = await ejs.renderFile(
            join(__dirname, "../deforestation/view/dds", "operators.ejs"),
            {
                report: body
            },
            { async: true }
        );

        await PDFpage.setContent(html);

        const pdfBuffer = await PDFpage.pdf({
            displayHeaderFooter: true,
            format: 'a4',
            footerTemplate: `<div style="width: 100%;">
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
}
