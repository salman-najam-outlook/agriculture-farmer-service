import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PastureMgmtService } from './pasture-mgmt.service';
import { PastureMgmt } from './entities/pasture-mgmt.entity';
import { CreatePastureMgmtInput } from './dto/create-pasture-mgmt.input';
import { UpdatePastureMgmtInput } from './dto/update-pasture-mgmt.input';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';
import { PasturePagination } from './dto/pasture-reports-pagination';

@Resolver(() => PastureMgmt)
export class PastureMgmtResolver {
  constructor(private readonly pastureMgmtService: PastureMgmtService) {}

  // @Mutation(() => PastureMgmt)
  // createPastureMgmt(
  //   @GetTokenData('userid') userId: number,
  //   @Args('createPastureMgmtInput')
  //   createPastureMgmtInput: CreatePastureMgmtInput,
  // ) {
  //   return this.pastureMgmtService.create(createPastureMgmtInput, userId);
  // }

  // @Query(() => [PastureMgmt], { name: 'pastureMgmt' })
  // findAll(@GetTokenData('userid') userId: number) {
  //   return this.pastureMgmtService.findAll(userId);
  @Mutation(() => String)
  async createPastureMgmt(
    @GetTokenData('userid') userId: number,
    @Args('createPastureMgmtInput')
    createPastureMgmtInput: CreatePastureMgmtInput,
  ) {
    let createRes = await this.pastureMgmtService.create(
      createPastureMgmtInput,
      userId,
    );
    return createRes;
  }

  @Query(() => PasturePagination, { name: 'pastureMgmtAll' })
  async findAll(
    @GetTokenData('userid') userId: number,
    @Args('status', { nullable: true, type: () => String }) status?: string,
    @Args('createdAt', { nullable: true, type: () => String })
    createdAt?: Date,
    @Args('dateOfInterest', { nullable: true, type: () => Date })
    dateOfInterest?: Date,
    @Args('page', { nullable: true, type: () => Int }) page?: number,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
    @Args('search', { nullable: true, type: () => String }) search?: string,
    @Args('orderField', { nullable: true, type: () => String })
    orderField?: string,
    @Args('order', { nullable: true, type: () => String }) order?: string,
  ) {
    try {
      let res = await this.pastureMgmtService.findAll(
        page,
        limit,
        search,
        order,
        orderField,
        userId,
        status,
        createdAt,
        dateOfInterest,
      );
      return res
    } catch (error) {
      console.log(error)
    }

  }

  @Query(() => PasturePagination, { name: 'pastureMgmtAllToday' })
  findAllToday(
    @GetTokenData('userid') userId: number,
    @Args('page', { nullable: true, type: () => Int }) page?: number,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
    @Args('search', { nullable: true, type: () => String }) search?: string,
    @Args('orderField', { nullable: true, type: () => String })
    orderField?: string,
    @Args('order', { nullable: true, type: () => String }) order?: string,
  ) {
    return this.pastureMgmtService.findAllToday(
      page,
      limit,
      search,
      order,
      orderField,
      userId,
    );
  }

  @Query(() => [PastureMgmt], { name: 'pastureMgmt' })
  findAllRecent(
    @GetTokenData('userid') userId: number,
    @Args('page', { nullable: true, type: () => Int }) page?: number,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
    @Args('search', { nullable: true, type: () => String }) search?: string,
    @Args('orderField', { nullable: true, type: () => String })
    orderField?: string,
    @Args('order', { nullable: true, type: () => String }) order?: string,
  ) {
    return this.pastureMgmtService.findAllRecent(
      page,
      limit,
      search,
      order,
      orderField,
      userId,
    );
  }

  @Query(() => PastureMgmt, { name: 'pastureMgmt' })
  findOne(
    @Args('id', { type: () => Int }) id: number,
    @GetTokenData('userid') userId: number,
  ) {
    return this.pastureMgmtService.findOne(id);
  }

  // @Mutation(() => PastureMgmt)
  // updatePastureMgmt(
  //   @Args('updatePastureMgmtInput')
  //   updatePastureMgmtInput: UpdatePastureMgmtInput,
  // ) {
  //   return this.pastureMgmtService.update(
  //     updatePastureMgmtInput.id,
  //     updatePastureMgmtInput,
  //   );
  // }

  @Mutation(() => PastureMgmt)
  removePastureMgmt(
    @GetTokenData('userid') userId: number,
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.pastureMgmtService.remove(id, userId);
  }
}
