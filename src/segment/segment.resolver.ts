import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SegmentService } from './segment.service';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';
import { Geofence } from 'src/geofence/entities/geofence.entity';
import { CreateSegmentInput } from './dto/create-segment.input';
import { UpdateSegmentInput } from './dto/update-segment.input';
import { Segment } from './entities/segment.entity';

@Resolver(() => Segment)
export class SegmentResolver {
  constructor(private readonly segmentService: SegmentService) {}

  @Mutation(() => Segment)
  async createSegment(
    @GetTokenData('userid') userId: number,
    @Args('createSegmentInput') createSegmentInput: CreateSegmentInput,
  ) {
    return await this.segmentService.create(createSegmentInput, userId);
  }

  @Query(() => [Geofence], { name: 'segment' })
  async findAll(
    @GetTokenData('userid') userId: number,
    @Args('farmId', { type: () => Int, nullable: true }) farmId: number,
  ) {
    return await this.segmentService.findAll(farmId, userId);
  }

  @Query(() => Geofence, { name: 'segment' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return await this.segmentService.findOne(id);
  }

  @Mutation(() => Segment)
  async updateSegment(
    @GetTokenData('userid') userId: number,
    @Args('updateSegmentInput') updateSegmentInput: UpdateSegmentInput,
  ) {
    return await this.segmentService.update(
      updateSegmentInput.id,
      updateSegmentInput,
      userId,
    );
  }

  @Mutation(() => Segment)
  async removeSegment(
    @GetTokenData('userid') userId: number,
    @Args('id', { type: () => Int }) id: number,
  ) {
    return await this.segmentService.remove(id, userId);
  }
}
