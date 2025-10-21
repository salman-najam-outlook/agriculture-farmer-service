import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MembershipService } from './membership.service';
import { Membership } from './entities/membership.entity';
import { CreateMembershipInput } from './dto/create-membership.input';
import { CreateUserMembershipInput } from './dto/create-user-membership.input';
import { CreatePaymentInput } from './dto/create-payment.input';
import { UpdateMembershipInput } from './dto/update-membership.input';
import { Addons } from './entities/add-ons.entity';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';
import { UserMembership } from './entities/userMembership.entity';
import { GetQueryDataArgs } from './dto/get-query-data.args';
import { PaymentMethods } from './entities/payment-methods.entity';
import { Payments } from './entities/payment.entity';
import { CreateUserAddonsInput } from './dto/create-user-addons.input';
import { UserAddons } from './entities/user-add-ons-map.entity';

@Resolver(() => Membership)
export class MembershipResolver {
  constructor(private readonly membershipService: MembershipService) {}

  @Mutation(() => Membership)
  createMembership(
    @GetTokenData('userid') userId: number,
    @Args('createMembershipInput') createMembershipInput: CreateMembershipInput) {
    return this.membershipService.create(createMembershipInput, userId);
  }

  @Query(() => [Membership], { name: 'getAllmembershipPlans', nullable: true })
  findAll() {
    return this.membershipService.findAll();
  }

  @Query(() => [UserMembership], { name: 'getUserMembershipPlan', nullable: true })
  async getUserMembershipPlan(@GetTokenData('userid') userId: number) {
    return await this.membershipService.getUserMembershipPlan(userId);
  }

  @Query(() => UserMembership, { name: 'getUserCurrentMembershipPlan', nullable: true })
  async getUserCurrentMembershipPlan(@GetTokenData('userid') userId: number) {
    return await this.membershipService.getUserCurrentMembershipPlan(userId);
  }

  

  @Query(() => [Addons], { name: 'getAllAddons', nullable: true })
  async getAllAddons(
    @Args('queryData') queryData: GetQueryDataArgs
  ) {
    return await this.membershipService.getAllAddons(queryData);
  }

  @Query(() => Membership, { name: 'membership' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.membershipService.findOne(id);
  }

  @Mutation(() => Membership)
  updateMembership(@Args('updateMembershipInput') updateMembershipInput: UpdateMembershipInput) {
    return this.membershipService.update(updateMembershipInput.id, updateMembershipInput);
  }

  @Mutation(() => Membership)
  removeMembership(@Args('id', { type: () => Int }) id: number) {
    return this.membershipService.remove(id);
  }

  // @Mutation(() => Membership)
  // buyMembership(
  //   @GetTokenData('userid') userId: number,
  //   @Args('buyMembershipInput') buyMembershipInput: BuyMembershipInput) {
  //   return this.membershipService.buyMembership(buyMembershipInput, userId);
  // }

  // paypalPayouts() {
  //   return this.membershipService.paypalPayouts();
  // }

  // buyMembership() {
  //   return this.membershipService.buyMembership();
  // }

  @Mutation(() => UserMembership)
  createUserMembership(
    @GetTokenData('userid') userId: number,
    @Args('createUserMembershipInput') createUserMembershipInput: CreateUserMembershipInput) {
    return this.membershipService.createUserMembership(createUserMembershipInput, userId);
  }

  @Mutation(() => [UserAddons])
  createUserAddons(
    @GetTokenData('userid') userId: number,
    @Args('createUserAddonsInput') createUserAddonsInput: CreateUserAddonsInput) {
    return this.membershipService.createUserAddons(createUserAddonsInput, userId);
  }

  @Query(() => [PaymentMethods], { name: 'getPaymentMethods', nullable: true })
  async getPaymentMethods() {
    return await this.membershipService.getPaymentMethods();
  }

  @Mutation(() => Payments)
  createPayment(
    @GetTokenData('userid') userId: number,
    @Args('createPaymentInput') createPaymentInput: CreatePaymentInput) {
    return this.membershipService.createPayment(createPaymentInput, userId);
  }


  @Query(() => UserMembership, { name: 'getCurrentMembershipOfCurrentUserFromHeader', nullable: true })
 async getCurrentMembershipOfCurrentUserFromHeader(
   @GetTokenData('memberships') memberships: string,
 ) {

  if(memberships && memberships != "" &&  typeof memberships !== 'undefined'){
    const membership = JSON.parse(memberships);
    console.log(membership.getUserCurrentMembershipPlan,"membershipmembership")
    return membership.getUserCurrentMembershipPlan;
  }

  return null;
 }


}
