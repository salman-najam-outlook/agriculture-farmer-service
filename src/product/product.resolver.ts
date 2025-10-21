import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { TranslationService } from 'src/translation/translation.service';
import { ManageProduct } from 'src/due-diligence/blend/manage-products/entities/manage-products.entity';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';

@Resolver(() => ManageProduct)
export class ProductResolver {
  constructor(private readonly productService: ProductService,
    private readonly translationService: TranslationService,
  ) {}


  @Query(() => [ManageProduct], { name: "deforestationProductList" })
  async findAll(
    @Context() context: any,
    @GetTokenData('organizationid') orgId: number
  ) {
    try {
      const rows = await this.productService.findAll(orgId);
      const translatedData =   await this.translationService.translateObject(rows, context, ['subproducts']);
      return translatedData;
    }
    catch (error) {
      const errorMessage = await this.translationService.translateWord('An error occurred while fetching the product list.', { req: context.req });
      throw new Error(errorMessage);
    }
  }
  
}
