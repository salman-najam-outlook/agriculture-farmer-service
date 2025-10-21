import { Resolver, Mutation, Args, Query, ID } from '@nestjs/graphql';
import { SubproductService } from '../services/subproduct.service';
import { ManageSubproduct } from '../entities/manage-subproduct.entity';
import { CreateManageSubproductDto } from '../dto/create-manage-subproduct.input';
import { UpdateManageSubproductDto } from '../dto/update-manage-subproduct.input';
import { ManageSubProductFilterInput, ManageSubProductPaginatedResponse } from '../dto/manage-sub-product-filter.input';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';

@Resolver(() => ManageSubproduct)
export class SubproductResolver {
  constructor(private readonly subproductService: SubproductService) {}

  @Mutation(() => ManageSubproduct)
  createManageSubproduct(
    @GetTokenData('userid') userId: number,
    @GetTokenData('organizationid') organizationId: number,
    @Args('createManageSubProductInput') createManageSubProductInput: CreateManageSubproductDto) {
    return this.subproductService.createSubProduct(createManageSubProductInput, userId, organizationId);
  }

  @Mutation(() => ManageSubproduct)
  updateManageSubproduct(@Args('updateManageSubProductInput') updateManageSubProductInput: UpdateManageSubproductDto) {
    return this.subproductService.update(updateManageSubProductInput.id, updateManageSubProductInput);
  }

  @Query(() => ManageSubProductPaginatedResponse, { name: 'manageSubProduct' })
  async manageSubProduct(
    @GetTokenData('organizationid') organizationId: number,
      @Args('filter', { nullable: false }) filter?: ManageSubProductFilterInput,
  ) {
    return this.subproductService.findAll(filter, organizationId);
  }

  @Mutation(() => Boolean)
  async deleteManageSubproduct(@Args('id', { type: () => ID }) id: number): Promise<boolean> {
    await this.subproductService.softDelete(id);
    return true;
  }
}
