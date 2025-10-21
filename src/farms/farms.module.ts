import { Module } from '@nestjs/common';
import { FarmsService } from './farms.service';
import { FarmsResolver } from './farms.resolver';
import { Farm } from './entities/farm.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { FarmCoordinates } from './entities/farmCoordinates.entity';
import { Sequelize } from 'sequelize-typescript';
import { Geofence } from 'src/geofence/entities/geofence.entity';
import { GeofenceCoordinates } from 'src/geofence/entities/geofenceCoordinates.entity';
import { User } from 'src/users/entities/user.entity';
import { Option } from './entities/options.entity';
import { PastureMgmt } from 'src/pasture-mgmt/entities/pasture-mgmt.entity';
import { DeforestationReportRequest } from 'src/deforestation/entities/deforestation_report_request.entity';
import { FarmLocation } from './entities/farmLocation.entity';
import { UserDDS } from 'src/users/entities/dds_user.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Farm,
      FarmCoordinates,
      Geofence,
      GeofenceCoordinates,
      User,
      UserDDS,
      Option,
      PastureMgmt,
      DeforestationReportRequest,
      FarmLocation,
    ]),
  ],
  providers: [
    FarmsResolver,
    FarmsService,
    { provide: 'SEQUELIZE', useExisting: Sequelize },
  ],
  exports: [SequelizeModule, FarmsService],
})
export class FarmsModule {}
