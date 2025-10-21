import { Resolver, Query, Mutation, Args, Int,ObjectType, Field, } from '@nestjs/graphql';
import { BlendSettingsService } from '../services/blend.service';
import { CreateBlendSettingsDto } from '../dto/create-blend-settings.input';
import { BlendSettings } from '../entities/blend-settings.entity';
import { UpdateBlendSettingsDto } from '../dto/update-blend-settings.dto';
import { BlendSettingsPaginationDto } from '../dto/blend-settings-pagination.input';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';
import { BlendSettingProduct } from '../entities/blend-setting-product.entity';

@ObjectType()
class BlendSettingsPaginationResult {
  @Field(() => [BlendSettings])
  rows: BlendSettings[];

  @Field(() => Int)
  count: number;
}
@Resolver(() => BlendSettings)
export class BlendSettingsResolver {
  constructor(private readonly blendSettingsService: BlendSettingsService) {}

  @Query(() => BlendSettings, { name: 'getBlendSettings' })
  async getBlendSettings(@Args('id') id: number): Promise<BlendSettings> {
    return this.blendSettingsService.findOne(id);
  }

  @Query(() => BlendSettingsPaginationResult, { name: 'listBlendSettings' })
  async listBlendSettings(
    @Args('paginationOptions', { type: () => BlendSettingsPaginationDto }) paginationOptions: BlendSettingsPaginationDto,
    @GetTokenData('organizationid') orgId: number,
  ): Promise<BlendSettingsPaginationResult> {
    return this.blendSettingsService.findAll(paginationOptions, orgId);
  }

  @Query(() => BlendSettingsPaginationResult, { name: 'listBlendSettingsByProductAndSubProduct' })
  async listBlendSettingsByProductAndSubProduct(
    @Args('paginationOptions', { type: () => BlendSettingsPaginationDto }) paginationOptions: BlendSettingsPaginationDto,
    @GetTokenData('organizationid') orgId: number,
  ): Promise<BlendSettingsPaginationResult> {
    return this.blendSettingsService.findAllByProductAndSubProduct(paginationOptions, orgId);
  }

  @Mutation(() => BlendSettings, { name: 'createBlendSettings' })
  async createBlendSettings(
    @GetTokenData('organizationid') organizationId: number,
    @Args('input') input: CreateBlendSettingsDto,
  ): Promise<BlendSettings> {
    return this.blendSettingsService.create(input, organizationId);
  }

  @Mutation(() => BlendSettings, { name: 'updateBlendSettings' })
  async updateBlendSettings(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateBlendSettingsDto,
    @GetTokenData('organizationid') organizationId: number,
  ): Promise<BlendSettings> {
    return this.blendSettingsService.update(id, input, organizationId);
  }

  @Mutation(() => Boolean, {name: 'deleteBlendSettings'})
async deleteBlendSettings(
  @Args('id', { type: () => Int }) id: number,
): Promise<boolean> {
  return this.blendSettingsService.delete(id);
}

}
