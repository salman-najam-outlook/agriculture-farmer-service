import {
  BadRequestException, 
  HttpException, 
  Inject, 
  Injectable, 
  Logger 
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, Sequelize } from "sequelize";
import { ApiCallHelper } from "src/helpers/api-call.helper";
import { RequestMethod } from "src/helpers/helper.interfaces";
import { CreateFarmInput, SearchUserFarmInput } from "./dto/create-farm.input";
import { UpdateFarmInput } from "./dto/update-farm.input";
import { Farm } from "./entities/farm.entity";
import { CreateFarmCoordsInput } from "./dto/create-farm-coordinates.input";
import { FarmCoordinates } from "./entities/farmCoordinates.entity";
import { Geofence } from "src/geofence/entities/geofence.entity";
import { GeofenceCoordinates } from "src/geofence/entities/geofenceCoordinates.entity";
import { UserDDS as User } from "src/users/entities/dds_user.entity";
import { Option } from "./entities/options.entity";
import { PastureMgmt } from "src/pasture-mgmt/entities/pasture-mgmt.entity";
import {
  DEFAULT_AREA_IN_HECTOR,
  HECTOR_TO_ACRE_FACTOR,
  MAX_NO_OF_FARMS,
  URL,
} from "src/config/constant";
import {
  CreateFarmLocationSyncInput,
  FarmSyncInput,
} from "./dto/farm-sync.input";
import { FarmType } from "src/due-diligence/production-place/dto/create-production-place.input";
import { FarmLocation } from "./entities/farmLocation.entity";
import { int } from "aws-sdk/clients/datapipeline";
import { getCoordinateHash } from 'src/helpers/coordinate.helper';

const includeAssociations = [
  FarmCoordinates,
  {
    model: Geofence,
    where: { is_deleted: 0 },
    required: false,
    include: [GeofenceCoordinates],
  },
  {
    model: User,
    as: "userDdsAssoc",
  },
  {
    model: Option,
    as: "farmTypeAssoc",
  },
  {
    model: Option,
    as: "productionSystemAssoc",
  },
];

@Injectable()
export class FarmsService {
  constructor(
    @InjectModel(Farm)
    private FarmModel: typeof Farm,
    @InjectModel(FarmCoordinates)
    private FarmCoordinatesModel: typeof FarmCoordinates,
    @InjectModel(FarmLocation)
    private FarmLocationModel: typeof FarmLocation,
    @InjectModel(Geofence)
    private GeofenceModel: typeof Geofence,
    @InjectModel(GeofenceCoordinates)
    private GeofenceCoordinatesModel: typeof GeofenceCoordinates,
    @InjectModel(User)
    private UserModel: typeof User,

    @InjectModel(PastureMgmt)
    private PastureMgmtModel: typeof PastureMgmt,

    @Inject("SEQUELIZE")
    private readonly sequelize: Sequelize,

    private apiCallHelper: ApiCallHelper,
  ) {}
  async create(
    createFarmInput: CreateFarmInput,
    userId: number
  ): Promise<Farm> {
    let transaction = await this.sequelize.transaction();
    try {
      const maxNo = MAX_NO_OF_FARMS;

      const farmCount = await this.FarmModel.count({
        where: { userId: userId, isDeleted: 0 },
      });
      if (farmCount >= maxNo) {
        throw new HttpException(`Only ${maxNo} farms are allowed.`, 400);
      }
      let createFarmInputFinal = {
        ...createFarmInput,
        area: createFarmInput.area === "" ? 0 : createFarmInput.area,
        productionSystem: JSON.stringify(createFarmInput.productionSystem),
      };
      let createRes = await this.FarmModel.create(
        { ...createFarmInputFinal, userId },
        { transaction }
      );
      let farmGeofence = createFarmInput.farmGeofence;
      let farmId = createRes.id;

      if (farmGeofence && farmGeofence.length > 0) {
        const farmCoordinates = farmGeofence.map((data) => {
          const { lat, log } = data;
          return {
            farmId,
            userId,
            lat,
            log,
          };
        });
        // insert data into the user farm coordinates
        await this.FarmCoordinatesModel.bulkCreate(farmCoordinates, {
          transaction,
        });
      }

      await transaction.commit();
      return createRes;
    } catch (error) {
      transaction.rollback();
      console.log("Farm create error", error);

      throw error;
    }
  }
  async createFarmCoords(createFarmCoordsInput: CreateFarmCoordsInput) {
    let tmpArr = [];
    tmpArr = createFarmCoordsInput.farmCoords;
    let createRes = await this.FarmCoordinatesModel.bulkCreate(tmpArr);
    return createRes;
  }

  async findAll(userId: number, token: string) {
    let farms = await this.FarmModel.findAll({
      where: {
        userId: userId,
        isDeleted: 0,
      },
    });

    // const url = `https://sass-api-dev.dimitra.dev/api/farm/primary`;
    // const { status, data } = await this.apiCallHelper.call<any>(
    //   RequestMethod.GET,
    //   url,
    //   {
    //     'oauth-token': token,
    //   },
    //   null,
    // );

    // if (status === 200 && data.success) {
    //   const respData = data.data;
    //   const payload: CreateFarmInput = {
    //     userId: userId,
    //     communityName: respData.communityName,
    //     address: respData.communityName,
    //     region: respData.region,
    //     district: respData.district,
    //     zipCode: respData.zipCode,
    //     farmName: respData.farmName,
    //     farmTypeName: respData.includeFarmType?.name,
    //     registrationNo: respData.registrationNo,
    //     ownerName: respData.ownerName,
    //     lat: respData.lat,
    //     log: respData.log,
    //     farmingGoalOcf_farmid:m: 1,
    //     farmOwner: respData.farmOwner,
    //     farmType: respData.farmType,
    //     productionSystem: respData.productionSystem,
    //     syncId: respData.id,
    //   };

    //   if (!farms) {
    //     await this.create(payload, userId);
    //   } else {
    //     await this.FarmModel.update(
    //       {
    //         farmName: respData.farmName,
    //         farmOwner: respData.farmOwner,
    //         farmType: respData.farmType,
    //         productionSystem: respData.productionSystem,
    //       },
    //       { where: { userId: userId, id: farms.id } },
    //     );
    //   }
    //   return await this.FarmModel.findAll({
    //     where: {
    //       userId: userId,
    //     },
    //   });
    // }
    return farms;
  }

  async getAllUserFarms(
    userId: number,
    searchUserFarmInput: SearchUserFarmInput
  ) {
    try {
      const { limit, page, searchPhrase, sortCol, sortOrder } =
        searchUserFarmInput;

      let whereQuery: any = {
        userId: userId,
        isDeleted: 0,
      };
      if (searchPhrase) {
        whereQuery = {
          ...whereQuery,
          [Op.or]: [
            { farmName: { [Op.like]: `%${searchPhrase}%` } },
            { farmOwner: { [Op.like]: `%${searchPhrase}%` } },
            { govRegistrationNum: { [Op.like]: `%${searchPhrase}%` } },
            { farmOwnershipType: { [Op.like]: `%${searchPhrase}%` } },
            { cooperativeId: { [Op.like]: `%${searchPhrase}%` } },
            { licenceNum: { [Op.like]: `%${searchPhrase}%` } },
          ],
        };
      }
      const query: any = {
        where: whereQuery,
        order: [[Sequelize.literal(sortCol), sortOrder]],
      };

      if (page && limit) {
        query.offset = (page - 1) * limit;
        query.limit = limit;
      }

      let responseArr = await this.FarmModel.findAndCountAll({
        ...query,
        include: includeAssociations,
        distinct: true,
      });

      return responseArr;
    } catch (err) {
      console.log(err.message);
      throw new Error(err.message);
    }
  }

  async primaryFarm(userId: number, farmId: number) {
    try {
      let result = await this.FarmModel.findOne({
        where: { userId, isDeleted: 0, id: farmId },
        include: includeAssociations,
      });
      if (!result) throw new HttpException("Primary Farm Not Found", 400);

      console.log(result, "resultresultresult");
      return result;
    } catch (err) {
      return err;
    }
  }

  async getAllFarmCoordinates(userId: number) {
    let farmRes = await this.FarmModel.findAll({
      where: { userId: userId },
      include: [FarmCoordinates],
    });
    return farmRes;
  }

  async getAllZoneCoordinates(userId: number) {
    try {
      let farmId = await this.FarmModel.findOne({
        attributes: ["id"],
        where: { userId: userId, isDeleted: 0 },
      });
      if (farmId) {
        farmId = JSON.parse(JSON.stringify(farmId)).id;
        let geofenceRes = await this.GeofenceModel.findAll({
          where: { farmId, is_deleted: 0 },
          include: [GeofenceCoordinates],
        });
        return geofenceRes;
      }
    } catch (error) {
      console.log(error);
      throw Error("Something went wrong!!");
    }
  }

  async findByCfFarmId(cf_farmid: number, cfUserId: number = null) {
    const farmDetail = await this.FarmModel.findOne({
      where: {
        cf_farmid: cf_farmid,
        userDdsId: {
          [Op.ne]: null,
        }
      }
    });

    if(farmDetail && cfUserId) {
      const sameFarms = await this.FarmModel.findAll({
        where: {
          cf_farmid,
          [Op.or]: [
            { userId: { [Op.is]: null } },
            { userId: { [Op.ne]: cfUserId } },
          ]
        },
        attributes: ['id'],
      });
      const farmIds = sameFarms.map(farm => farm.id);
      await this.FarmModel.update({ userId: cfUserId }, {
        where: {
          id: {[Op.in]: farmIds}
        }
      });
    }
    return farmDetail;
  }

  async findAllByCfFarmId(cf_farmid: number) {
    const farmDetail = await this.FarmModel.findAll({
      where: {
        cf_farmid: cf_farmid
      },
      attributes: ['id'],
    });
    const ddsFarmIds = farmDetail.map(farm => farm.id); 

    return ddsFarmIds;
  }

  async findOne(id: number) {
    const farmDetail = await this.FarmModel.findOne({
      where: { id },
      include: includeAssociations,
    });
    if (!farmDetail) throw new HttpException("Farm Not Found", 400);
    return farmDetail;
  }

  async delete(id: number) {
    try {
      let res = await this.FarmModel.update(
        { isDeleted: 1 },
        { where: { id } }
      );
      await this.GeofenceModel.update(
        { is_deleted: 1 },
        { where: { farmId: id } }
      );
      // await this.DeforestationReportModel.update(
      //   { isDeleted: 1 },
      //   { where: { farmId: id } },
      // );
      let userId = await this.FarmModel.findOne({
        attributes: ["userId"],
        where: { id },
      });
      userId = JSON.parse(JSON.stringify(userId)).userId;
      await this.PastureMgmtModel.update(
        { is_deleted: 1 },
        { where: { userId } }
      );
      if (res) {
        return "Deletion Successful";
      }
    } catch (error) {
      throw Error("Deletion Unsuccessful");
    }
  }

  async update(
    updateFarmInput: UpdateFarmInput,
    farmId: number,
    userId: number
  ) {
    let transaction = await this.sequelize.transaction();
    try {
      let existingFarm = await this.FarmModel.findOne({
        where: { id: farmId },
      });
      let farmGeofence = updateFarmInput.farmGeofence;
      let updateFarmInputFinal = {
        ...updateFarmInput,
        productionSystem: JSON.stringify(updateFarmInput.productionSystem),
      };

      let updateRes = await this.FarmModel.update(
        { ...updateFarmInputFinal, userId },
        { where: { id: farmId } }
      );

      if (farmGeofence && updateRes) {
        const farmCoordinates = farmGeofence.map((data) => {
          const { lat, log } = data;
          return {
            farmId,
            userId,
            lat,
            log,
          };
        });

        // check if there were changes in geofence
        if (existingFarm.area != updateFarmInput.area) {
          // Delete old coordinated of geofencing
          await this.FarmCoordinatesModel.destroy({
            where: {
              farmId,
            },
            transaction,
          });

          // insert data into the user farm coordinates
          await this.FarmCoordinatesModel.bulkCreate(farmCoordinates, {
            transaction,
          });
        }
      }

      await transaction.commit();
      return await this.FarmModel.findOne({ where: { id: farmId } });
    } catch (error) {
      transaction.rollback();
      console.log("Farm update error", error);

      throw error;
    }
  }

  remove(id: number, userId: number) {
    return `This action removes a #${id} farm`;
  }

  async pullFarmFromCF(userId: number, cfFarmId: number, token: string): Promise<Farm> {
    // Pulling farm from CF
    try {
      const endpoint = `${URL.CF_BASEURL}/admin/farm/${cfFarmId}`;
      const response = await this.apiCallHelper.call(RequestMethod.GET, endpoint, {
        "content-type": "application/json",
        "oauth-token":  token,
      },{});
      if(!response.data?.data) throw new Error('Farm not found');
      const farmData = response.data.data;
      // Saving farm data
      const farm = await this.FarmModel.create({
        cf_farmid: cfFarmId,
        farmName: farmData.farmName,
        goal: farmData.farmGoals?.[0]?.farmingGoal,
        registrationNo: farmData?.registrationNo,
        lat: farmData.lat ? Number.parseFloat(farmData.lat) : null,
        log: farmData.log ? Number.parseFloat(farmData.log) : null,
        address: farmData?.address,
        area: `${farmData.area}`,
        areaUomId: farmData.areaUomId ? Number.parseInt(farmData.areaUomId) : null,
        parameter: farmData.parameter ? Number.parseFloat(farmData.parameter) : null,
        farmType: farmData.farmType ? Number.parseInt(farmData.farmType) : null,
        parameterUomId: farmData.parameterUomId ? Number.parseInt(farmData.parameterUomId) : null,
        farmerRegId: farmData.farmerRegistrationId ? Number.parseInt(farmData.farmerRegistrationId) : null,
        farmOwnershipType: farmData?.farmOwnershipType,
        productionSystem: farmData?.productionSystem,
        farmOwner: farmData?.farmOwner,
        userDdsId: userId,
        country: farmData?.country,
        state: farmData?.state,
        city: farmData?.city,
        govRegistrationNum: farmData?.govRegistrationNum,
        contractMating: farmData?.contractMating,
        cooperativeId: farmData?.cooperativeId,
        licenceNum: farmData?.licenceNum,
        licenceExpiryDate: farmData?.licenceExpiryDate,
        regulatorName: farmData?.regulatorName,
        houseNum: farmData?.houseNum,
        street: farmData?.street,
        regulatorRepresentiveName: farmData?.regulatorRepresentiveName,
        farmingActivity: farmData?.farmingActivity,
      });

      if (farmData?.coordinates?.length) {
        for await (const coord of farmData.coordinates) {
          await this.FarmCoordinatesModel.create({
            farmId: farm.id,
            lat: coord.lat,
            log: coord.log
          });
        }
      }

      if (farmData?.segments?.length) {
        for await (const geofence of farmData.segments) {
          const { coordinates, ...geofenceInput } = geofence;
          const newGeofence = await this.GeofenceModel.create({
            userDdsId: userId,
            farmId: farm.id,
            ...geofenceInput,
            coordinateHash: getCoordinateHash(coordinates?.length ? coordinates : geofenceInput),
          });
          await this.GeofenceCoordinatesModel.bulkCreate(coordinates.map((coord: {id: number, lat: number, log: number}) => ({
            geofenceId: newGeofence.id,
            lat: coord.lat,
            log: coord.log
          })));
        }
      }

      return farm;
    } catch (err) {
      console.error(err);
      throw new BadRequestException("No data fetch  from cf,cc");
    }
  }

  async syncFarmFromCF(farmSyncInput: FarmSyncInput) {
    try {
      const { syncType } = farmSyncInput;
      if (syncType === "ADDED" || syncType === "UPDATED") {
        return await this.performAddFarmSync(farmSyncInput);
      }
  
      return await this.performDeleteFarmSync(farmSyncInput);
    } catch (error) {
      console.log(error.message);
      Logger.log(error.message);
    }
  }

  private async performDeleteFarmSync(farmSyncInput: FarmSyncInput) {
    const { cfFarmId, cfUserId } = farmSyncInput;
    const userDetail = await this.UserModel.findOne({
      where: { cf_userid: cfUserId },
    });
    if (!userDetail) throw new HttpException("User not found", 400);
    await this.FarmModel.update(
      { isDeleted: 1 },
      { where: { cf_farmid: cfFarmId, userId: userDetail.id } }
    );
  }

  private async performAddFarmSync(farmSyncInput: FarmSyncInput) {
    const { cfFarmId, cfUserId, ...farmInput } = farmSyncInput;
    try {
      const userDetail = await this.UserModel.findOne({
        where: { cf_userid: cfUserId },
      });
      if (!userDetail) throw new HttpException("User not found", 400);

      let latitude: string, longitude: string;

      if (farmInput.farmType === FarmType.POINT) {
        ({ centerLatitude: latitude, centerLongitude: longitude } =
          farmInput.pointCoordinates);
      } else if (
        farmInput.farmType === FarmType.POLYGON &&
        farmInput.coordinates.length > 0
      ) {
        ({ latitude, longitude } = farmInput.coordinates[0]);
      }
      const isFarmAlreadyExists = await this.FarmModel.findOne({
        where: { cf_farmid: cfFarmId, userId: userDetail.id, isDeleted: 0 },
      });

      if (!isFarmAlreadyExists) {
        const farmDetail = await this.FarmModel.create({
          farmName: farmInput.farmName,
          area:
            farmInput.farmType === FarmType.POINT && !farmInput.areaInAcre
              ? DEFAULT_AREA_IN_HECTOR * HECTOR_TO_ACRE_FACTOR
              : farmInput.areaInAcre, // if area is not provided for POINT type then set 4ha by default
          userId: userDetail.id,
          address: farmInput.location,
          lat: latitude,
          log: longitude,
          cf_farmid: cfFarmId,
        });
        await this.createFarmLocation("ADDED", {
          farmName: farmInput.farmName,
          area: farmInput.areaInAcre,
          farmType: farmInput.farmType,
          location: farmInput.location,
          coordinates: farmInput.coordinates,
          pointCoordinates: farmInput.pointCoordinates,
          farmId: farmDetail.id,
          userId: userDetail.id,
        });
      } else {
        await this.FarmModel.update(
          {
            farmName: farmInput.farmName,
            area:
              farmInput.farmType === FarmType.POINT && !farmInput.areaInAcre
                ? DEFAULT_AREA_IN_HECTOR * HECTOR_TO_ACRE_FACTOR
                : farmInput.areaInAcre, // if area is not provided for POINT type then set 4ha by default
            address: farmInput.location,
            lat: latitude,
            log: longitude,
          },
          {
            where: {
              id: isFarmAlreadyExists.id,
            },
          }
        );
        await this.createFarmLocation("UPDATED", {
          farmName: farmInput.farmName,
          area: farmInput.areaInAcre,
          farmType: farmInput.farmType,
          location: farmInput.location,
          coordinates: farmInput.coordinates,
          pointCoordinates: farmInput.pointCoordinates,
          farmId: isFarmAlreadyExists.id,
          userId: userDetail.id,
        });
      }
    } catch (error) {
      console.log(error.message);
      Logger.log(error.message);
    }
  }
  /**
   *
   * @param createFarmLocationInput
   */
 private createFarmLocation = async (
    syncType: string,
    createFarmLocationInput: CreateFarmLocationSyncInput
  ) => {
    const { area, userId, farmId, pointCoordinates, coordinates, farmType } =
      createFarmLocationInput;
    try {
      let primaryLocation = await this.FarmLocationModel.findOne({
        where: {
          farmId: farmId,
          isDeleted: 0,
          isPrimary: 1,
        },
      });

      const farmLocationPayload = {
        area: area ?? 0,
        userId,
        recordId: new Date().getTime(),
      };

      if (syncType == "UPDATED" && primaryLocation) {
        await this.FarmLocationModel.update(
          { farmLocationPayload },
          {
            where: { id: primaryLocation.id },
          }
        );
      } else {
        primaryLocation = await FarmLocation.create(
          { ...farmLocationPayload, isPrimary: true },
          {}
        );
      }

      if (farmType === FarmType.POINT && pointCoordinates) {
        const {
          radius: geofenceRadius,
          centerLatitude,
          centerLongitude,
        } = pointCoordinates;

        const geofencePayload = {
          farmLocationId: primaryLocation?.id,
          userId,
          farmId,
          geofenceArea: area,
          geofenceRadius: geofenceRadius ?? 0,
          geofenceCenterLat: centerLatitude,
          geofenceCenterLog: centerLongitude,
          isPrimary: 1,
        };
        const geoFenceExists = await this.GeofenceModel.findOne({
          where: {
            farmLocationId: primaryLocation?.id,
            isPrimary: 1,
            farmId: farmId,
            userId: userId,
          },
        });

        if (geoFenceExists && syncType === "UPDATED") {
          await this.GeofenceModel.update(geofencePayload, {
            where: {
              id: geoFenceExists.id,
            },
          });
        } else {
          await this.GeofenceModel.create(geofencePayload, {});
        }
      } else if (farmType === FarmType.POLYGON && coordinates) {
        const geofencePayload = {
          farmLocationId: primaryLocation?.id,
          userId,
          farmId,
          geofenceArea: area,
          isPrimary: 1,
        };
        let geoFenceExists = await this.GeofenceModel.findOne({
          where: {
            farmLocationId: primaryLocation?.id,
            isPrimary: 1,
            farmId: farmId,
            userId: userId,
          },
        });

        if (geoFenceExists && syncType === "UPDATED") {
          await this.GeofenceModel.update(geofencePayload, {
            where: {
              id: geoFenceExists.id,
            },
          });
        } else {
          geoFenceExists = await this.GeofenceModel.create(geofencePayload, {});
        }

        if (syncType == "UPDATED" && coordinates) {
          await this.FarmCoordinatesModel.destroy({
            where: {
              farmId: farmId,
              userId: userId,
            },
          });
          await this.GeofenceCoordinatesModel.destroy({
            where: {
              geofenceId: geoFenceExists?.id,
            },
          });
        }

        const polygonPayloads = coordinates.map((element: any) => ({
          geofenceId: geoFenceExists?.id,
          lat: element.latitude,
          log: element.longitude,
        }));

        await this.GeofenceCoordinatesModel.bulkCreate(polygonPayloads, {});

        // Create user farm coordinates here
        const coordinatePayload = coordinates.map((coord) => ({
          farmId: farmId,
          lat: coord.latitude,
          log: coord.longitude,
          userId: userId,
        }));

        await this.FarmCoordinatesModel.bulkCreate(coordinatePayload, {});
      }
    } catch (error) {
      console.log(error.message);
      Logger.log(error.message);
      // throw new Error(error.message);
    }
  };
}
