import {Body, Controller,
    Headers,
    NotFoundException,
    BadRequestException,
    Post,
    Param,
    Get,
    Res,
    Query,
    Render,
    UploadedFile,
    UseInterceptors,
    Req,
} from "@nestjs/common";
import { Sequelize as sequelize } from 'sequelize';

import { FileInterceptor } from "@nestjs/platform-express";
import { verify } from "jsonwebtoken";
import * as path from "path";
import { DiligenceReport } from 'src/diligence-report/entities/diligence-report.entity';
import { InjectModel } from '@nestjs/sequelize';
import { ProductionPlaceService } from '../due-diligence/production-place/production-place.service'
import { DiligenceReportService } from './diligence-report.service'
import { Farm } from "src/farms/entities/farm.entity";
import { DueDiligenceProductionPlace, EudrDeforestationStatus } from 'src/due-diligence/production-place/entities/production-place.entity';
import { FarmCoordinates } from "src/farms/entities/farmCoordinates.entity";
import { FarmLocation } from "src/farms/entities/farmLocation.entity";
import { Geofence } from "src/geofence/entities/geofence.entity";
import { GeofenceCoordinates } from "src/geofence/entities/geofenceCoordinates.entity";
import { UserDDS as User } from "src/users/entities/dds_user.entity";
import { EudrSetting } from "src/eudr-settings/entities/eudr-setting.entity"
import { DeclarationStatements } from "src/eudr-settings/entities/declaration-statements.entity"
import * as ejs from "ejs";
import { Request } from "express";
import * as puppeteer from "puppeteer";
import { join } from "path";
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller("api/diligence-report")
export class DiligenceReportController {
    ACRE_TO_HECTURE_FACTOR = 2.471
    constructor(
        private readonly dueDiligenceService: DiligenceReportService,
        @InjectModel(DiligenceReport) private DiligenceReportModel: typeof DiligenceReport,
        @InjectModel(User) private UserModel: typeof User,
        @InjectModel(EudrSetting) private EudrSettingModel: typeof EudrSetting,
        @InjectModel(DueDiligenceProductionPlace) private DueDiligenceProductionPlaceModel: typeof DueDiligenceProductionPlace,
    ) { }
    
    async getReportD(id:number): Promise<any> {
        const report = await this.dueDiligenceService.findOne(id)
        const settings = await this.EudrSettingModel.findOne({
            include: [
                {
                    model: DeclarationStatements,
                    as: "declarations",
                }
            ],
            where: {
                org_id: report.organizationId
            }
        })
        const include = [
            {
                model: Farm,
                where: {
                    isDeleted: 0
                },
                required: true,
                include: [
                    {
                        model: Geofence,
                        as: "GeoFences",
                        required: false,
                    },
                    {
                        model: User,
                        as: "userDdsAssoc",
                        required: true
                    },
                ]
            }
        ];

        const statusSortOrders = [
            EudrDeforestationStatus.VERY_HIGH_PROBABILITY,
            EudrDeforestationStatus.HIGH_DEFORESTATION_PROBABILITY,
            EudrDeforestationStatus.MEDIUM_PROBABILITY,
            EudrDeforestationStatus.LOW_DEFORESTATION_PROBABILITY,
            EudrDeforestationStatus.VERY_LOW_DEFORESTATION_PROBABILITY,
            EudrDeforestationStatus.ZERO_NEGLIGIBLE_DEFORESTATION_PROBABILITY,
            EudrDeforestationStatus.MANUALLY_MITIGATED,
        ];

        let productionPlaces = await this.DueDiligenceProductionPlaceModel.findAll({
            include: include,
            where: {
                dueDiligenceReportId: id
            },
            order: [
                [sequelize.literal(
                    `FIELD(eudr_deforestation_status, '${statusSortOrders.join("','")}')`),
                    'ASC'],
            ] 
        })

        let totalArea: number = 0
        let totalHighDeforestationCount = 0
        let totalPolygon = 0
        let totalPoint = 0
        let diligenceReportAssessmentLength = 0
        let am = []

        const production = productionPlaces.map((row) => {
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

            if (farmType == 'Point') {
                totalPoint += 1
            } else if (farmType == 'Polygon') {
                totalPolygon += 1
            }
            if (!row.removed) {
                totalArea += Number(farm.area)
            }
            if (
                row.eudr_deforestation_status == EudrDeforestationStatus.HIGH_PROBABILITY ||
                row.eudr_deforestation_status == EudrDeforestationStatus.HIGH_DEFORESTATION_PROBABILITY ||
                row.eudr_deforestation_status == EudrDeforestationStatus.VERY_HIGH_PROBABILITY) {
                totalHighDeforestationCount += 1;
            }

            if (row.eudr_deforestation_status) {
                diligenceReportAssessmentLength += 1
            }else{
                 am.push(row.dueDiligenceReportId)
            }

            return {
                ...row.toJSON(),
                farmType: farmType
            };
        });
        let declarations = []
        if (settings && report.supplier) {
            declarations = settings.declarations?.map((declaration) => declaration.description.replace('[name]', `${report.supplier.firstName} ${report.supplier.lastName}`));
        }
        const totalHec = totalArea ? (totalArea / this.ACRE_TO_HECTURE_FACTOR).toFixed(2) : totalArea
        return {
            report: report,
            productionPlaces: production.filter(x => !x.removed),
            removedProductionPlaces: production.filter(x => x.removed),
            totalArea: totalHec,
            totalHighDeforestationCount: totalHighDeforestationCount,
            totalPolygon: totalPolygon,
            totalPoint: totalPoint,
            declarations: declarations,
            diligenceReportAssessmentLength: diligenceReportAssessmentLength
        }
    }

    @Get("final-report-pdf/:id")
    async generateFinalReport(
        @Req() req: Request,
        @Param() params: any,
        @Headers() headers,
        @I18n() i18n: I18nContext,
        @Res() res
    ) {
        const lang = typeof req.headers?.lang === 'string' ? req.headers.lang : "en";
        const {
            report,
            productionPlaces,
            removedProductionPlaces,
            totalArea,
            totalHighDeforestationCount,
            totalPoint,
            totalPolygon,
            declarations,
            diligenceReportAssessmentLength
        } = await this.getReportD(params.id)

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();

        let html = await ejs.renderFile(
            join(__dirname, "../deforestation/view", "final-report.ejs"),
            {
                lang,
                report: report,
                productionPlaces,
                removedProductionPlaces,
                totalArea,
                totalHighDeforestationCount: totalHighDeforestationCount,
                totalPolygon: totalPolygon,
                totalPoint: totalPoint,
                declarations: declarations,
                diligenceReportAssessmentLength: diligenceReportAssessmentLength,
                t: i18n.t.bind(i18n),
            },
            { async: true }
        );

        await page.setContent(html);

        const pdfBuffer = await page.pdf({
            displayHeaderFooter: true,
            format: 'a4',
            timeout:300000,
            footerTemplate: `<div style="width: 100%;">
            <div style="border-top: 1px solid #787878; margin-top:10px; font-size: 8px; line-height: 1; text-color: #000000; padding: 16px 12px; display: flex; align-items: flex-end; justify-content: space-between;">
              <div>Dimitra.io</div>
              <div>${i18n.t('message.page', { lang })} <span class="pageNumber"></span> ${i18n.t('message.of', { lang })} <span class="totalPages"></span></div>
            </div>
          </div>`
        });

        await browser.close();

        res.setHeader('Content-Disposition', 'attachment; filename=document.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);
    }


    async getDumpReport(report:DiligenceReport): Promise<any> {
        const settings = await this.EudrSettingModel.findOne({
            include: [
                {
                    model: DeclarationStatements,
                    as: "declarations",
                }
            ],
            where: {
                org_id: report.organizationId
            }
        })
        const include = [
            {
                model: Farm,
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
                    }, {
                        model: FarmCoordinates,
                        as: "FarmCoordinates",
                        required: false
                    }, {
                        model: User,
                        as: "userDdsAssoc",
                        required: true
                    },
                ]
            }
        ];
        
        let productionPlaces = await this.DueDiligenceProductionPlaceModel.findAll({
            include: include,
            where:{
                dueDiligenceReportId:report.id
            }
        })

        let totalArea: number = 0
        let totalHighDeforestationCount = 0
        let totalPolygon = 0
        let totalPoint = 0
        let diligenceReportAssessmentLength = 0
        let lowZeroRiskFarm = 0
        let highRiskFarmArea = 0
        let totalLowZeroFarmArea = 0

        const production = productionPlaces.map((row) => {
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

            if (farmType == 'Point') {
                totalPoint += 1
            } else if (farmType == 'Polygon') {
                totalPolygon += 1
            }

            if (!row.removed) {
                totalArea += Number(farm.area)
            }

            if (
                row.eudr_deforestation_status == EudrDeforestationStatus.HIGH_PROBABILITY ||
                row.eudr_deforestation_status == EudrDeforestationStatus.HIGH_DEFORESTATION_PROBABILITY ||
                row.eudr_deforestation_status == EudrDeforestationStatus.VERY_HIGH_PROBABILITY) {

                totalHighDeforestationCount += 1;
                const hcArea = farm.area ? (Number(farm.area)/this.ACRE_TO_HECTURE_FACTOR) : 0
                highRiskFarmArea +=  Number(hcArea.toFixed(2))
            }

            if (row.eudr_deforestation_status) {
                diligenceReportAssessmentLength += 1
            }

            if([EudrDeforestationStatus.LOW_PROBABILITY, 
                EudrDeforestationStatus.LOW_DEFORESTATION_PROBABILITY,
                EudrDeforestationStatus.ZERO_NEGLIGIBLE_DEFORESTATION_PROBABILITY,
                EudrDeforestationStatus.ZERO_NEG_PROBABILITY,
                EudrDeforestationStatus.VERY_LOW_PROBABILITY,
                EudrDeforestationStatus.VERY_LOW_DEFORESTATION_PROBABILITY
            ].includes(row.eudr_deforestation_status)){
                lowZeroRiskFarm += 1
                const hcArea12 = farm.area ? (Number(farm.area)/this.ACRE_TO_HECTURE_FACTOR) : 0
                totalLowZeroFarmArea += Number(hcArea12.toFixed(2))
            }

            return {
                ...row.toJSON(),
                farmType: farmType

            };
        });
        let declarations = []
        if (settings && report.supplier) {
            declarations = settings.declarations?.map((declaration) => declaration.description.replace('[name]', `${report.supplier.firstName} ${report.supplier.lastName}`));
        }
        const totalHec = totalArea ? (totalArea / this.ACRE_TO_HECTURE_FACTOR).toFixed(2) : totalArea
        
        return {
            report: report,
            productionPlaces: production.filter(x => !x.removed),
            removedProductionPlaces: production.filter(x => x.removed),
            totalArea: totalHec,
            totalHighDeforestationCount: totalHighDeforestationCount,
            totalPolygon: totalPolygon,
            totalPoint: totalPoint,
            declarations: declarations,
            highRiskFarmArea:highRiskFarmArea,
            totalLowZeroFarmArea,
            lowZeroRiskFarm,
            diligenceReportAssessmentLength: diligenceReportAssessmentLength
        }
    }


    @Get("final-report-dump/:reportId")
    async finalReportDump(
        @Param() params: any,
        @Headers() headers,
        @Res() res
    ) {
        const firstReport  = await this.DiligenceReportModel.findOne({
            include:[
                'supplier',
                'operator'
            ],
            where: {
                id: params.reportId
            }
        })

        const {
            report,
            totalArea,
            totalHighDeforestationCount,
            totalPoint,
            totalPolygon,
            declarations,
            productionPlaces,
            highRiskFarmArea,
            totalLowZeroFarmArea,
            diligenceReportAssessmentLength,
            lowZeroRiskFarm
        } = await this.getDumpReport(firstReport)

        return res.status(200).json({
            report,
            totalArea,
            totalHighDeforestationCount,
            totalPoint,
            totalPolygon,
            declarations,
            highRiskFarmArea,
            totalLowZeroFarmArea,
            totalNumberOfFarms: productionPlaces.length,
            lowZeroRiskFarm,
            productionPlaces,
            diligenceReportAssessmentLength
        })
    }

    @Get("diligence-report-pdf")
    async getDiligenceReportPDF(
        @Query() queryP,
        @Headers() headers,
        @Res() res
    ) {
        const {
            page,
            limit,
            country,
            status,
            searchPhrase,
            supplierId
        } = queryP
        const serviceParam = {
            page:Number(page) || null,
            limit:Number(limit) || null,
            country,
            status,
            searchPhrase,
            supplierId
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
       
        const response = await this.dueDiligenceService.findAll(serviceParam, organization)
        const newrs = response.rows.map(x => {
            return {
                ...x.toJSON(),
                productionPlaceCount1:x.productionPlaceCount
            }
        })

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const PDFpage = await browser.newPage();

        let html = await ejs.renderFile(
            join(__dirname, "../deforestation/view/dds", "diligence-report.ejs"),
            {
               report:newrs
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

    @Get("diligence-report-csv")
    async getDiligenceReportCSV(
        @Query() queryP,
        @Headers() headers,
        @Res() res
    ) {
        const {
            page,
            limit,
            country,
            status,
            searchPhrase,
            supplierId
        } = queryP
        const serviceParam = {
            page:1,
            limit:100000,
            country,
            status,
            searchPhrase,
            supplierId
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
       
        const response = await this.dueDiligenceService.findAll(serviceParam, organization)
        const newrs = response.rows.map(x => {
            return {
                ...x.toJSON(),
                productionPlaceCount1:x.productionPlaceCount
            }
        })

    const XLSX = require('xlsx');

    const excelHeaders = [
        "Internal Reference No",
        "Supplier",
        "Product",
        "No. of farms",
        "Quantity(kg)",
        "Country",
        "Submission Date",
        "Last Updated",
        "Due Diligence Status"
    ];

    const excelRows = newrs.map(row => [
        row.internalReferenceNumber || '',
        row.supplier?.firstName || '',
        row.product_detail?.name || '',
        row.productionPlaceCount ?? 0,
        row.productNetMass && Number(row.productNetMass) ? Number(row.productNetMass).toFixed(2) : '',
        row.countryOfEntry || '',
        row.createdAt || '',
        row.updatedAt || '',
        row.status || ''
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([excelHeaders, ...excelRows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DiligenceReport');

    // Write Excel file to a buffer
    const excelBuffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx'
    });

    // Send Excel file as response
    res.setHeader('Content-Disposition', 'attachment; filename="diligence-report.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(excelBuffer);

     
    
    }



}
