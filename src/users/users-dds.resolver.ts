import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveReference,
} from '@nestjs/graphql';
import { CreateUserInput, CurrentDDSUserOutput } from './dto/create-user.input';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';
import { UsersDdsService } from './users-dds.service';
import { UserDDS } from './entities/dds_user.entity';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => UserDDS)
export class UsersDdsResolver {
  constructor(private readonly usersDdsService: UsersDdsService) {}

  @Mutation(() => UserDDS, { name: 'updateUserDDS' })
  async updateUser(
    @GetTokenData('userid') userId: number,
    @Args('updateUserInput') updateUserInput: UpdateUserInput
  ) {
    return await this.usersDdsService.update(userId, updateUserInput);
  }


  @Mutation(() => UserDDS)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    let res = await this.usersDdsService.create(createUserInput);
    return res;
  }

  @Query(() => [UserDDS], { name: 'users' })
  findAll() {
    return this.usersDdsService.findAll();
  }

  @Query(() => UserDDS, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usersDdsService.findOne(id);
  }

  @Query(() => [UserDDS], { name: 'findAllUsersByOrganization' })
  findByOrganization(@GetTokenData('organizationid') organizationId: number) {
    return this.usersDdsService.findByOrganization(organizationId);
  }

  @Query(() => CurrentDDSUserOutput, { name: 'currentUserDDS' })
  currentUser(@GetTokenData('userid') userId: number) {
    return this.usersDdsService.currentUser(userId);
  }

  @ResolveReference()
  async resolveReference(reference: { __typename: string; id: number }) {
    return await this.usersDdsService.findOne(reference.id);
  }

  @Query(() => [UserDDS], { name: 'findAllSuppliersOrOperators' })
  findAllSuppliersOrOperators(
    @GetTokenData('organizationid') organizationId:number,
    @GetTokenData('subOrganizationId') subOrganizationId:number,
    @Args('role') role:string   // role must be either 'supplier' or 'operator'.
  ) {
    return this.usersDdsService.findAllSuppliersOrOperators(organizationId, role, subOrganizationId);
  }

}
