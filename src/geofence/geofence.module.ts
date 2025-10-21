import { Module } from '@nestjs/common';
import { GeofenceService } from './geofence.service';
import { GeofenceResolver } from './geofence.resolver';
import { Geofence } from './entities/geofence.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { GeofenceCoordinates } from './entities/geofenceCoordinates.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Geofence, GeofenceCoordinates])
  ],
  providers: [GeofenceResolver, GeofenceService],
  exports: [GeofenceService]
})
export class GeofenceModule {}
