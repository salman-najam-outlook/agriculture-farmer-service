import { Inject, Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Geofence } from 'src/geofence/entities/geofence.entity';
import { GeofenceCoordinates } from 'src/geofence/entities/geofenceCoordinates.entity';
import { PastureMgmt } from 'src/pasture-mgmt/entities/pasture-mgmt.entity';
import { CreateSegmentInput } from './dto/create-segment.input';
import { UpdateSegmentInput } from './dto/update-segment.input';

@Injectable()
export class SegmentService {
  constructor(
    @InjectModel(Geofence)
    private GeofenceModel: typeof Geofence,

    @InjectModel(GeofenceCoordinates)
    private GeofenceCoordinatesModel: typeof GeofenceCoordinates,

    @InjectModel(PastureMgmt)
    private PastureMgmtModel: typeof PastureMgmt,

    @Inject('SEQUELIZE')
    private readonly sequelize: Sequelize,
  ) {}

  async create(createSegmentInput: CreateSegmentInput, userId: number) {
    let transaction = await this.sequelize.transaction();

    try {
      const { farmId, segments } = createSegmentInput;

      for (let i = 0; i < segments.length; i++) {
        const {
          coordinates,
          geofenceName,
          geofenceArea,
          geofenceAreaUOMId,
          geofenceParameter,
          geofenceParameterUOMId,
        } = segments[i];
        let set = {
          userId,
          farmId,
          geofenceName,
          geofenceArea,
          geofenceAreaUOMId,
          geofenceParameter,
          geofenceParameterUOMId,
        };

        // insert into geofence table
        const geofence = await this.GeofenceModel.create(set, { transaction });

        // Add geofence id with lat and log
        const geofenceCoordinate = coordinates.map((element) => {
          return { ...element, geofenceId: geofence.id };
        });

        // insert coordinates into geofence-coordinate table
        await this.GeofenceCoordinatesModel.bulkCreate(geofenceCoordinate, {
          transaction,
        });
      }
      await transaction.commit();
      return { success: true };
    } catch (err) {
      transaction.rollback();
      console.log(err);
      throw err;
    }
  }

  async findAll(farmId: number, userId: number) {
    let where: any = { userId: userId, is_deleted: 0 };

    where = farmId ? { ...where, farmId: farmId, is_deleted: 0 } : where;
    return await this.GeofenceModel.findAll({
      where: where,
      include: [GeofenceCoordinates],
    });
  }

  async findOne(id: number) {
    const geofence = await this.GeofenceModel.findOne({
      where: { id: id, is_deleted: 0},
      include: [GeofenceCoordinates],
    });

    if (!geofence) throw new HttpException('Not Found', 400);
    return geofence;
  }

  async update(
    id: number,
    updateSegmentInput: UpdateSegmentInput,
    userId: number,
  ) {
    let transaction = await this.sequelize.transaction();
    try {
      const {
        farmId,
        coordinates,
        geofenceName,
        geofenceArea,
        geofenceAreaUOMId,
        geofenceParameter,
        geofenceParameterUOMId,
      } = updateSegmentInput;
      let set = {
        farmId,
        geofenceName,
        geofenceArea,
        geofenceAreaUOMId,
        geofenceParameter,
        geofenceParameterUOMId,
      };
      // update geofencing data
      let geofence = await this.GeofenceModel.update(set, {
        where: { id, userId },
        transaction,
      });

      if (coordinates?.length) {
        // Add geofence id with lat and log
        let geofenceCoordinate = coordinates.map((element) => {
          return { ...element, geofenceId: id };
        });

        // Delete old coordinated of geofencing
        await this.GeofenceCoordinatesModel.destroy({
          where: {
            geofenceId: id,
          },
          transaction,
        });

        // insert new coordinate of geofencing
        await this.GeofenceCoordinatesModel.bulkCreate(geofenceCoordinate, {
          transaction,
        });
      }
      await transaction.commit();
      return { success: true };
    } catch (err) {
      await transaction?.rollback();
      console.log(err);
      throw err;
    }
  }

  async remove(id: number, userId: number) {
    let transaction = await this.sequelize.transaction();
    try {
      // Delete geofencing coordinates
      // await this.GeofenceCoordinatesModel.destroy({
      //   where: {
      //     geofenceId: id,
      //   },
      //   transaction,
      // });

      // Delete geofence details
      // await this.GeofenceModel.destroy({
      //   where: { id, userId },
      //   transaction,
      // });

      await this.GeofenceModel.update(
        { is_deleted: 1 },
        { where: { id, userId } },
      );
      let zoneName = await this.GeofenceModel.findOne({
        attributes: ['geofenceName'],
        where: { id },
      })
      zoneName = JSON.parse(JSON.stringify(zoneName)).geofenceName

      await this.PastureMgmtModel.update(
        { is_deleted: 1 },
        { where: { locationName: zoneName } },
      )
      // commit if everything is good
      await transaction.commit();

      // send response back to the client
      return { success: true };
    } catch (err) {
      await transaction?.rollback();
      console.log(err);
      throw err;
    }
  }
}
