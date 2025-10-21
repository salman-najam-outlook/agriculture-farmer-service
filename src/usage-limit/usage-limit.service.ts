import { Injectable } from '@nestjs/common';
import {UsesLimitInput} from "./dto/uses-limit.input";
import {MonthlyLimit} from "./entities/report-limit.entity";
import {GeofenceCoordinates} from "../geofence/entities/geofenceCoordinates.entity";
import {InjectModel} from "@nestjs/sequelize";
import {DueDiligenceProductionPlace} from "../due-diligence/production-place/entities/production-place.entity";
import {Organization} from "../users/entities/organization.entity";
import {ReportsType} from "./entities/reports-type.entity";
import {Assessment} from "../assessment-builder/entities/assessment.entity";
import{DiligenceReport} from "../diligence-report/entities/diligence-report.entity";
import {Op} from "sequelize";
import {DiligenceReportAssessment} from "../diligence-report/entities/diligence-report-assessment.entity";
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class UsageLimitService {
    constructor(
        @InjectModel(MonthlyLimit) private monthlyLimitModel: typeof MonthlyLimit,
        @InjectModel(Assessment) private assessmentModel: typeof Assessment,
        @InjectModel(DiligenceReport) private diligenceReportModel: typeof DiligenceReport,
    ) {}
 async getUsageLimit(input:UsesLimitInput){
     const { organizationId } = input;
     const include =[
         {
             model: Organization,
             where: {},
             required: true,
         },
         {
             model: ReportsType,
             where: {},
             required: true,
         }
     ]
     const where: any = {organization_id: organizationId};
     const monthlyLimit= await this.monthlyLimitModel.findAll({where,include})
     const monthlyUsed = await Promise.all(monthlyLimit.map(async (limit) => {
         let used=0;
         if(limit.report_type.name=="Due Diligence Reports"){

             const where={
                 organizationId:organizationId,
                 eudrUploadedAt: {
                     [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                     [Op.lt]: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                 },
                 status:'Uploaded to EU Portal'
             }
             used= await this.diligenceReportModel.count({where})


         }else if(limit.report_type.name=="EUDR Deforestation Assessments"){

             used = await DueDiligenceProductionPlace.count({
                 include: [
                     {
                         model: DiligenceReport,
                         where: {
                             organizationId: organizationId,
                             createdAt: {
                                 [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                                 [Op.lt]: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                             },
                             eudrAssessmentType:{
                                 [Op.not]:'Existing Deforestation Report'
                             }
                         },
                         required: true
                     }
                 ],
                 where: {
                     eudr_deforestation_status: {
                         [Op.not]: null
                     }
                 }
             });


         }else if(limit.report_type.name=="Risk Assessments"){
             const oneForEachCount = await DueDiligenceProductionPlace.count({
                 include: [
                     {
                         model: DiligenceReport,
                         where: {
                             organizationId: organizationId,
                             createdAt: {
                                 [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                                 [Op.lt]: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
                             },
                         },
                         required: true,
                         include: [
                             {
                                 model: DiligenceReportAssessment,
                                 where: {
                                     existing_survey: {
                                         [Op.not]: 'existing',
                                     },
                                     placement: 'one_for_each',
                                 },
                                 required: true,
                             },
                         ],
                     },
                 ]
             });

             const oneForAllCount = await DiligenceReportAssessment.count({
                 where: {
                     placement: 'one_for_all',
                 },
                 include: [
                     {
                         model: DiligenceReport,
                         where: {
                             organizationId: organizationId,
                             createdAt: {
                                 [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                                 [Op.lt]: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
                             },
                         },
                         include: [
                            {
                              model: Product,
                              required: false,
                              attributes: ['id', 'name'],
                              as: 'product_detail'
                            },
                        ],
                     },
                 ],
             });

             used=oneForAllCount+oneForEachCount
         }

         return {
             ...limit.toJSON(),
             used,
         };
     }));
     return monthlyUsed
 }
}
