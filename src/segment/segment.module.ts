import { Module } from '@nestjs/common';
import { SegmentService } from './segment.service';
import { SegmentResolver } from './segment.resolver';
import { SequelizeModule } from '@nestjs/sequelize';
import { Geofence } from 'src/geofence/entities/geofence.entity';
import { GeofenceCoordinates } from 'src/geofence/entities/geofenceCoordinates.entity';
import { Sequelize } from 'sequelize-typescript';
import { PastureMgmt } from 'src/pasture-mgmt/entities/pasture-mgmt.entity';

@Module({
  imports: [SequelizeModule.forFeature([Geofence, GeofenceCoordinates, PastureMgmt])],
  providers: [
    SegmentResolver,
    SegmentService,
    { provide: 'SEQUELIZE', useExisting: Sequelize },
  ],
  exports: [SequelizeModule],
})
export class SegmentModule {}
