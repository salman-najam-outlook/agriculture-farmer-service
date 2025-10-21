import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveReference
} from '@nestjs/graphql';
import { FarmsService } from './farms.service';
import { Farm } from './entities/farm.entity';
import {
  CreateFarmInput,
  FarmListResponse,
  SearchUserFarmInput,
} from './dto/create-farm.input';
import { UpdateFarmInput } from './dto/update-farm.input';
import { CreateFarmCoordsInput } from './dto/create-farm-coordinates.input';
import { FarmCoordinates } from './entities/farmCoordinates.entity';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';
import { Geofence } from 'src/geofence/entities/geofence.entity';

@Resolver(() => Farm)
export class FarmsResolver {
  constructor(private readonly farmsService: FarmsService) {}

  @Mutation(() => Farm)
  async createFarm(
    @GetTokenData('userid') userId: number,
    @Args('createFarmInput') createFarmInput: CreateFarmInput,
  ) {
    try {
      return await this.farmsService.create(createFarmInput, userId);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Mutation(() => [FarmCoordinates])
  async createFarmCoords(
    @Args('createFarmCoordsInput') createFarmCoordsInput: CreateFarmCoordsInput,
  ) {
    try {
      return await this.farmsService.createFarmCoords(createFarmCoordsInput);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Query(() => [Farm], { name: 'farms' })
  findAll(
    @GetTokenData('userid') userId: number,
    @GetTokenData('authorization') token: string,
  ) {
    return this.farmsService.findAll(userId, token);
  }

  @Query(() => FarmListResponse, { name: 'allUserFarms' })
  async getAllUserFarms(
    @GetTokenData('userid') userId: number,
    @Args('searchUserFarmInput')
    searchUserFarmInput: SearchUserFarmInput,
  ) {
    try {
      const farmList = await this.farmsService.getAllUserFarms(
        userId || 123637,
        searchUserFarmInput,
      );
      const fetchedRows = farmList.rows.length;

      return {
        ...farmList,
        fetchedRows,
      };
    } catch (err) {
      console.log(err.message);
      throw new Error(err.message);
    }
  }

  @Query(() => Farm, { name: 'farm' })
  findOne(
    @Args('id', { type: () => Int }) id: number,
    @GetTokenData('userid') userId: number,
  ) {
    return this.farmsService.findOne(id);
  }

  @Query(() => Farm, { name: 'primaryFarm' })
  async primaryFarm(
    @GetTokenData('userid') userId: number,
    @Args('farmId', { type: () => Int, nullable: true }) farmId: number
  ) {
    try {
      let res = await this.farmsService.primaryFarm(userId, farmId);
      return res;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  @Query(() => [Farm], { name: 'getAllFarmCoordinates' })
  async getAllFarmCoordinates(@GetTokenData('userid') userId: number) {
    return await this.farmsService.getAllFarmCoordinates(userId);
  }

  @Query(() => [Geofence], { name: 'getAllZoneCoordinates' })
  async getAllZoneCoordinates(@GetTokenData('userid') userId: number) {
    return await this.farmsService.getAllZoneCoordinates(userId);
  }

  @Mutation(() => Farm)
  updateFarm(
    @Args('updateFarmInput') updateFarmInput: UpdateFarmInput,
    @GetTokenData('userid') userId: number,
  ) {
    return this.farmsService.update(
      updateFarmInput,
      updateFarmInput.id,
      userId,
    );
  }

  @Mutation(() => String)
  deleteFarm(
    @Args('farmId', { type: () => Int, nullable: true }) farmId: number,
  ) {
    let res = this.farmsService.delete(farmId);
    return res;
  }

  @Mutation(() => Farm)
  removeFarm(
    @Args('id', { type: () => Int }) id: number,
    @GetTokenData('userid') userId: number,
  ) {
    return this.farmsService.remove(id, userId);
  }

  @ResolveReference()
  async resolveReference(reference: { __typename: string; id: number }) {
    return await this.farmsService.findOne(reference.id);
  }
}
