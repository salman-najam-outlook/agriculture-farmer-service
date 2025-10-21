import { CreateAssessmentMitigationInput } from './create-assessment-mitigation.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateAssessmentMitigationInput extends PartialType(CreateAssessmentMitigationInput) {
  @Field(() => Int)
  id: number;
}
