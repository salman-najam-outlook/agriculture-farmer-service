import { Resolver, Mutation, Args, Query, Int, ID } from '@nestjs/graphql';
import { ExemptProductService } from '../services/exempt-product.service';
import { ExemptProduct } from '../entities/exempt-product.entity';
import { ExemptProductsPaginatedResponse } from '../exempt-product.response';
import { ExemptProductsFilterInput } from '../dto/filter-exempt-product.dto';
import { ExemptProductDto } from '../dto/exempt-product.input';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';
import { UpdateExemptProductDto } from '../dto/update-exempt-product.input';

@Resolver(() => ExemptProduct)
export class ExemptProductResolver {
  constructor(
    private readonly exemptProductService: ExemptProductService
  ) {}

  @Query(() => ExemptProductsPaginatedResponse, { name:"getExemptProducts" })
  async getExemptProducts(
    @GetTokenData('organizationid') organizationId: number,
    @Args('filter', { nullable: true }) filter?: ExemptProductsFilterInput,
  ) {
     return this.exemptProductService.getExemptProducts(organizationId, filter);
  }

  @Query(() => ExemptProduct, { name: "exemptProduct" })
  async findOne(
    @Args("id", { type: () => ID }) id: number
  ) {
    return await this.exemptProductService.findOne(id);
  }

  @Mutation(() => ExemptProduct)
  createExemptProduct(
    @GetTokenData('userid') userId: number,
    @GetTokenData('organizationid') organizationId: number,
    @Args('dto') dto: ExemptProductDto
  ) {
    return this.exemptProductService.create(dto, organizationId, userId);
  }

  @Mutation(() => ExemptProduct)
  updateExemptProduct(
    @Args('dto') dto: UpdateExemptProductDto
  ) {
    return this.exemptProductService.update(dto);
  }

  @Mutation(() => Boolean)
  async softDeleteExemptProduct(@Args('id', { type: () => ID }) id: number) {
    await this.exemptProductService.softDelete(id);
    return true;
  }

  @Mutation(() => Boolean)
  async updateAvailabilityExemptProduct(@Args('id', { type: () => ID }) id: number, @Args('availability') availability: boolean) {
    await this.exemptProductService.updateAvailability(id, availability);
    return true;
  }
}
