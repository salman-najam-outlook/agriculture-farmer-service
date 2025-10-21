import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateGeofenceInput } from './dto/create-geofence.input';
import { UpdateGeofenceInput } from './dto/update-geofence.input';
import { Geofence } from './entities/geofence.entity';
import { GeofenceCoordinates } from './entities/geofenceCoordinates.entity';
import { CreateGeofenceInputArr } from './dto/create-geofence-coordinates.input';
import { Farm } from 'src/farms/entities/farm.entity';

@Injectable()
export class GeofenceService {
  constructor(
    @InjectModel(Geofence)
    private GeofenceModel: typeof Geofence,
    @InjectModel(GeofenceCoordinates)
    private GeofenceCoordinatesModel: typeof GeofenceCoordinates,
  ) {}
  async create(createGeofenceInput: CreateGeofenceInput, userId: number) {
    let createRes = await this.GeofenceModel.create({
      ...createGeofenceInput,
      userId: userId,
    });
    return createRes;
  }
  async createManyGeofenceCoords(
    createGeofenceInputArr: CreateGeofenceInputArr,
  ) {
    let inputArr = [];
    inputArr = createGeofenceInputArr.geoFenceCoords;
    let createRes = await this.GeofenceCoordinatesModel.bulkCreate(inputArr);
    return createRes;
  }

  findAll() {
    return `This action returns all geofence`;
  }

  async getAllUserSegments(userId: number) {
    return await this.GeofenceModel.findAll({
      where: {
        userId: userId,
        is_deleted: 0
      },
      include: [GeofenceCoordinates, Farm],
    });
  }

  async findOne(id: number) {
    return await this.GeofenceModel.findOne({ where: { id, is_deleted: 0 } });
  }

  update(id: number, updateGeofenceInput: UpdateGeofenceInput, userId: number) {
    return `This action updates a #${id} geofence`;
  }

  remove(id: number) {
    return `This action removes a #${id} geofence`;
  }
}
