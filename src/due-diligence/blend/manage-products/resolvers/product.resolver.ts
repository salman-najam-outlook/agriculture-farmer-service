import { Resolver, Mutation, Query, Args, ID } from '@nestjs/graphql';
import { ProductService } from '../services/product.service';
import { ManageProduct } from '../entities/manage-products.entity';
import { CreateManageProductDto } from '../dto/create-manage-product.input';
import { UpdateManageProductDto } from '../dto/update-manage-product.input';
import {
  ManageProductFilterInput,
  ManageProductPaginatedResponse,
} from '../dto/manage-product-filter.input';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';

@Resolver(() => ManageProduct)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Mutation(() => ManageProduct)
  createManageProduct(
    @GetTokenData('userid') userId: number,
    @GetTokenData('organizationid') organizationId: number,
    @Args('createManageProductInput')
    createManageProductInput: CreateManageProductDto
  ) {
    try {
      return this.productService.create(
        createManageProductInput,
        userId,
        organizationId
      );
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => ManageProduct)
  updateManageProduct(
    @Args('updateManageProductInput')
    updateManageProductInput: UpdateManageProductDto
  ) {
    return this.productService.update(
      updateManageProductInput.id,
      updateManageProductInput
    );
  }

  @Mutation(() => Boolean)
  async deleteManageProduct(
    @Args('id', { type: () => ID }) id: number
  ): Promise<boolean> {
    await this.productService.softDelete(id);
    return true;
  }

  @Query(() => ManageProductPaginatedResponse, { name: 'manageProduct' })
  async manageProduct(
    @GetTokenData('organizationid') organizationId: number,
    @Args('filter', { nullable: false }) filter?: ManageProductFilterInput
  ) {
    return this.productService.findAll(filter, organizationId);
  }

  @Query(() => ManageProduct, { name: 'manageProductById' })
  async manageProductById(@Args('id', { type: () => ID }) id: number) {
    return this.productService.findOne(id);
  }
}
