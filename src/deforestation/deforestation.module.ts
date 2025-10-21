import { forwardRef, Module } from "@nestjs/common";
import { DeforestationService } from "./deforestation.service";
import { DeforestationResolver } from "./deforestation.resolver";
import { SequelizeModule } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { DeforestationReportRequest } from "./entities/deforestation_report_request.entity";
import { ReportRequestCoordinates } from "./entities/request-coordinates.entity";
import { DeforestrationSateliteResponse } from "./entities/deforestation_satelite_response.entity";
import { FarmsModule } from "src/farms/farms.module";
import { S3 } from "./s3.service";
import { DeforestationController } from "./deforestation.controller";
import { MulterModule } from "@nestjs/platform-express";
import { User } from "src/users/entities/user.entity";
import { Farm } from "src/farms/entities/farm.entity";
import { Geofence } from "src/geofence/entities/geofence.entity";
import { GeofenceCoordinates } from "src/geofence/entities/geofenceCoordinates.entity";
import { Organization } from "src/users/entities/organization.entity";
import { DeforestationHelperService } from "./deforestation.helper";
import { DueDiligenceProductionPlace } from "src/due-diligence/production-place/entities/production-place.entity";
import { JobModule } from 'src/job/job.module';
import { DiligenceReport } from 'src/diligence-report/entities/diligence-report.entity';
import { EudrSetting } from 'src/eudr-settings/entities/eudr-setting.entity';
import { MessageQueueingModule } from "src/message-queueing/message-queueing.module";
import { ProductionPlaceDeforestationInfo } from 'src/due-diligence/production-place/entities/production-place-deforestation-info.entity';
import { DiligenceReportProductionPlace } from 'src/diligence-report/entities/diligence-report-production-place.entity';
import { SolanaModule } from 'src/solana/solana.module';

@Module({
  imports: [
    FarmsModule,
    MessageQueueingModule,
    SolanaModule,
    SequelizeModule.forFeature([
      DeforestationReportRequest,
      ReportRequestCoordinates,
      DeforestrationSateliteResponse,
      User,
      Farm,
      Geofence,
      GeofenceCoordinates,
      Organization,
      DueDiligenceProductionPlace,
      DiligenceReport,
      EudrSetting,
      DiligenceReportProductionPlace,
      ProductionPlaceDeforestationInfo,
    ]),
    forwardRef(() => JobModule),
    forwardRef(() => SolanaModule),
    // MulterModule.register({
    //   dest: "./uploads", // Make sure this directory exists
    // }),
  ],
  providers: [
    S3,
    DeforestationResolver,
    DeforestationService,
    { provide: "SEQUELIZE", useExisting: Sequelize },
    DeforestationHelperService,
  ],
  exports: [SequelizeModule, DeforestationService],
  controllers: [DeforestationController],
})
export class DeforestationModule {}
