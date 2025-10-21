import { Module } from '@nestjs/common';
import { UsageLimitResolver } from './usage-limit.resolver';
import { UsageLimitService } from './usage-limit.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {MonthlyLimit} from "./entities/report-limit.entity";
import {ReportsType} from "./entities/reports-type.entity";
import {Assessment} from "../assessment-builder/entities/assessment.entity";
import {Organization} from "../users/entities/organization.entity";
import {DiligenceReport} from "../diligence-report/entities/diligence-report.entity";

@Module({
  imports:[
    SequelizeModule.forFeature([
      MonthlyLimit,
      ReportsType,
      Assessment,
        Organization,
        DiligenceReport
    ]),
  ],
  providers: [UsageLimitResolver, UsageLimitService],
  exports: [SequelizeModule],
})
export class UsageLimitModule {}
