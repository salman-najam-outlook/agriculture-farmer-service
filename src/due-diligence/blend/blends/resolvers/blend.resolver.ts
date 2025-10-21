import { Resolver, Mutation, Args, Query, ID, Context, Int, Float } from '@nestjs/graphql';
import { BlendService } from '../services/blends.service';
import { CreateBlendInput, DdrMetricsDto } from '../dto/create-blend.input';
import { Blend } from '../entities/blend.entity';
import { BlendListingPaginationDto } from '../dto/blend-pagination-filter.dto';
import { BlendListFilterInput, FindAllBlendsResponse } from '../dto/blend-response.dto';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';
import { BlendProductFilter } from '../dto/blend-product.filter';
import { UpdateBlendInput } from '../dto/update-blend.dto';
import { BlendProductsResponse } from '../dto/blend-products-response.dto';
import { DiligenceReport } from 'src/diligence-report/entities/diligence-report.entity';
import { BlendProduct } from '../entities/blend-product.entity';

@Resolver(() => Blend)
export class BlendResolver {
  constructor(private readonly blendService: BlendService) {}
  @Mutation(() => Blend)
  async createBlend(
    @Args('createBlendInput') createBlendInput: CreateBlendInput,
    @GetTokenData('organizationid') organizationId: number,
    @GetTokenData('userid') userId: number,
  ): Promise<Blend> {
    return await this.blendService.createBlend(createBlendInput, userId, organizationId);
  }

   @Query(() => FindAllBlendsResponse, { description: 'Fetch all blends with details' })
    async findAllBlends(
      @GetTokenData('organizationid') organizationId: number,
       @Args('filter', { nullable: false }) filter?: BlendListFilterInput
    ): Promise<FindAllBlendsResponse> {
      return await this.blendService.listAllBlends(organizationId, filter);
    }

  @Query(() => Blend, { name: "blend" })
  async blend(
    @Args("id", { type: () => ID }) id: number
  ) {
    return await this.blendService.findBlendReport(id);
  }
  
  @Query(() => BlendProductsResponse, { name: "blendProducts" })
  async blendProducts(
    @GetTokenData('organizationid') organizationId: number,
    @Args("filter") filter: BlendProductFilter,
  ) {
    return await this.blendService.blendProducts(organizationId, filter);
  }

  @Mutation(() => Blend)
  async updateBlend(
    @GetTokenData('organizationid') organizationId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('input') updateBlendInput: UpdateBlendInput,
  ): Promise<Blend> {
    return await this.blendService.updateBlend(id, updateBlendInput, organizationId);
  }

  @Mutation(() => Blend)
  async duplicateBlend(
    @GetTokenData('userid') userId: number,
    @Args('id', { type: () => Int }) id: number  ) {
    try {
      return await this.blendService.copyAndCreate(id);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Mutation(() => Boolean)
  async deleteBlend(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    const result = await this.blendService.deleteBlend(id);
    return result.success;
  }

  @Mutation(() => Boolean)
  async hideDdsReportFromBlendProducts(
    @Args('blendId', { type: () => Int }) blendId: number, 
    @Args('ddrId', { type: () => Int }) ddrId: number
  ): Promise<boolean> {
    await this.blendService.hideDdsReportFromBlendProducts(blendId, ddrId);
    return true;
  }

  @Query(() => DdrMetricsDto, { name: 'findReportByDdrId' })
  async findReportByDdrId(
    @Args('ddrId', { type: () => [Int] }) ddrId: [number],
  ): Promise<DdrMetricsDto> {
    return this.blendService.findReportDdrId(ddrId);
  }

}