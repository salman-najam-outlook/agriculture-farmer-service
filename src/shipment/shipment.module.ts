import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { MailModule } from 'src/mail/mail.module';
import { Shipment } from './entities/shipment.entity';

import { ShipmentStop } from './entities/shipment-stop.entity';
import { ShipmentDueDeligenceReport } from './entities/shipment-duedeligence-report.entity';

import { ShipmentResolver } from './shipment.resolver';
import { ShipmentService  } from './shipment.service';
import  { ShipmentController } from './shipment.controller'
import {DiligenceReport} from "../diligence-report/entities/diligence-report.entity";
import { DiligenceReportProductionPlace } from 'src/diligence-report/entities/diligence-report-production-place.entity';
import { UserDDS } from 'src/users/entities/dds_user.entity';
import { UsersModule } from 'src/users/users.module';
import { DueDiligenceProductionPlace } from 'src/due-diligence/production-place/entities/production-place.entity';
import { ProductionPlaceDeforestationInfo } from 'src/due-diligence/production-place/entities/production-place-deforestation-info.entity';
import { DiligenceReportModule } from "src/diligence-report/diligence-report.module";


@Module({
  imports: [
    MailModule,
    DiligenceReportModule,
    SequelizeModule.forFeature([
      Shipment,
      ShipmentStop,
      ShipmentDueDeligenceReport,
      DiligenceReport,
      DiligenceReportProductionPlace,
      UserDDS,
      DueDiligenceProductionPlace,
      ProductionPlaceDeforestationInfo
    ]),
    UsersModule,
  ],
  providers: [
    ShipmentResolver,
    ShipmentService,
    DueDiligenceProductionPlace,
    { provide: 'SEQUELIZE', useExisting: Sequelize },
  ],
  exports: [SequelizeModule],
  controllers:[ShipmentController]
})
export class ShipmentModule {}
