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
    Render,
} from "@nestjs/common";
import { Request } from "express";
import { verify } from "jsonwebtoken";
import { InjectModel } from '@nestjs/sequelize';
import { UserDDS as User } from "src/users/entities/dds_user.entity";
import * as ejs from "ejs";
import { ShipmentService } from './shipment.service';
import * as puppeteer from "puppeteer";
import { join } from "path";

@Controller("api/shipment")
export class ShipmentController {
   
    constructor(
        @InjectModel(User) private UserModel: typeof User,
        private readonly shipmentService: ShipmentService) {

    }

    @Get("shipment-pdf")
    async getGenerateShipmentPdf(
        @Req() req:Request,
        @Query() queryP,
        @Headers() headers,
        @Res() res
    ) {
        const {
            page,
            limit,
            search
        } = queryP
        const serviceParam = {
            page:Number(page) || null,
            limit:Number(limit) || null,
            search,
        }
        let organization;
        let userId;
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
        if (!organization || !userId) {
            throw new NotFoundException("Could not download a file");
        }
        const response = await this.shipmentService.findAll(serviceParam, userId, organization)

        const rs = response.rows.map(x => {
            let count = 0;
            let quantity = 0;
            x?.shipmentReports.forEach(element => {
                count += element?.dueDeligenceReport.dueDiligenceProductionPlaces?.length  
                quantity +=  Number(element?.dueDeligenceReport?.productNetMass) 
            });
            return {
                noOfFarms:count,
                productQuantity:quantity,
                ...x.toJSON()
            }
        })

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page1 = await browser.newPage();

        let html = await ejs.renderFile(
            join(__dirname, "../deforestation/view/dds", "shipments.ejs"),
            {
                report: rs
            },
            { async: true }
        );

        await page1.setContent(html);

        const pdfBuffer = await page1.pdf({
            displayHeaderFooter: true,
            format: 'a4',
            timeout:300000,
            footerTemplate: `<div style="width: 100%;">
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


}
