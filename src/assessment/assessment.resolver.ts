import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AssesmentService } from './assessment.service';
import { Assesment } from './entities/assessment.entity';

@Resolver(() => Assesment)
export class AssesmentResolver {
  constructor(private readonly assesmentService: AssesmentService) {}


  @Query(() => [Assesment], { name: "getAssessmentList" })
  async findAll() {
    return await this.assesmentService.findAll();
  }
  
}
