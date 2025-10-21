import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveReference,
} from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput, CurrentUserOutput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    let res = await this.usersService.create(createUserInput);
    return res;
  }

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOne(id);
  }

  @Query(() => [User], { name: 'findAllUsersByOrganization' })
  findByOrganization(@Args('organizationId', { type: () => Int }) organizationId: number) {
    return this.usersService.findByOrganization(organizationId);
  }

  @Query(() => CurrentUserOutput, { name: 'currentUser' })
  currentUser(@GetTokenData('userid') userId: number) {
    return this.usersService.currentUser(userId || 123637);
  }

  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.remove(id);
  }

  @ResolveReference()
  async resolveReference(reference: { __typename: string; id: number }) {
    return await this.usersService.findOne(reference.id);
  }


}
