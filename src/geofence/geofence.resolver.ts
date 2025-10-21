import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveReference,
} from '@nestjs/graphql';
import { GeofenceService } from './geofence.service';
import { Geofence } from './entities/geofence.entity';
import { CreateGeofenceInput } from './dto/create-geofence.input';
import { UpdateGeofenceInput } from './dto/update-geofence.input';
import { CreateGeofenceInputArr } from './dto/create-geofence-coordinates.input';
import { GeofenceCoordinates } from './entities/geofenceCoordinates.entity';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';

@Resolver(() => Geofence)
export class GeofenceResolver {
  constructor(private readonly geofenceService: GeofenceService) {}

  @Mutation(() => Geofence)
  async createGeofence(
    @Args('createGeofenceInput') createGeofenceInput: CreateGeofenceInput,
    @GetTokenData('userid') userId: number,
  ) {
    let res = this.geofenceService.create(createGeofenceInput, userId);
    return res;
  }

  @Mutation(() => [GeofenceCoordinates])
  async createManyGeofenceCoords(
    @Args('createGeofenceInputArr')
    createGeofenceInputArr: CreateGeofenceInputArr,
  ) {
    let res = this.geofenceService.createManyGeofenceCoords(
      createGeofenceInputArr,
    );
    return res;
  }

  @Query(() => [Geofence], { name: 'geofence' })
  findAll() {
    return this.geofenceService.findAll();
  }

  @Query(() => [Geofence], { name: 'allUserSegments' })
  getAllUserSegments(@GetTokenData('userid') userId: number) {
    return this.geofenceService.getAllUserSegments(userId);
  }

  @Query(() => [Geofence], { name: 'getGeoFenceOfUser' })
  async getGeofenceOfTokenUser(@GetTokenData('userid') userId: number) {
    return await this.geofenceService.getAllUserSegments(userId);
  }

  @Query(() => Geofence, { name: 'geofence' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.geofenceService.findOne(id);
  }

  @Mutation(() => Geofence)
  updateGeofence(
    @Args('updateGeofenceInput') updateGeofenceInput: UpdateGeofenceInput,
    @GetTokenData('userid') userId: number,
  ) {
    return this.geofenceService.update(
      updateGeofenceInput.id,
      updateGeofenceInput,
      userId,
    );
  }

  @Mutation(() => Geofence)
  removeGeofence(@Args('id', { type: () => Int }) id: number) {
    return this.geofenceService.remove(id);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: number; id: number }) {
    return this.geofenceService.findOne(reference.id);
  }
}
