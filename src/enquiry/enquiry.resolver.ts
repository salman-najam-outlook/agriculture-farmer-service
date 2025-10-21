import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { EnquiryService } from './enquiry.service';
import { Enquiry } from './entities/enquiry.entity';
import {
  CreateEnquiryInput,
  EnquiryPagination,
} from './dto/create-enquiry.input';
import { UpdateEnquiryInput } from './dto/update-enquiry.input';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';
import { HttpException } from '@nestjs/common';

@Resolver(() => Enquiry)
export class EnquiryResolver {
  constructor(private readonly enquiryService: EnquiryService) {}

  @Mutation(() => Enquiry)
  async createEnquiry(
    @GetTokenData('userid') userId: number,
    @Args('createEnquiryInput') createEnquiryInput: CreateEnquiryInput,
  ) {
    return await this.enquiryService.create(
      createEnquiryInput,
      userId || 123764,
    );
  }

  @Query(() => EnquiryPagination, { name: 'enquiry' })
  findAll(
    @GetTokenData('userid') userId: number,
    @Args('page', { nullable: true }) page: number,
    @Args('limit', { nullable: true }) limit: number,
    @Args('status', { nullable: true, type: () => String }) status?: string,
  ) {
    if (!['open', 'pending', 'resolved', 'rejected'].includes(status)) {
      throw new HttpException('Invalid status', 400);
    }
    return this.enquiryService.findAll(userId, status, page, limit);
  }

  @Mutation(() => Enquiry)
  async updateEnquiry(
    @Args('updateEnquiryInput') updateEnquiryInput: UpdateEnquiryInput,
  ) {
    return await this.enquiryService.update(
      updateEnquiryInput.id,
      updateEnquiryInput,
    );
  }

  @Mutation(() => Boolean)
  async removeEnquiry(@Args('id', { type: () => Int }) id: number) {
    return await this.enquiryService.remove(id);
  }
}
