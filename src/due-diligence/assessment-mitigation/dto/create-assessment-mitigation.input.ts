import { InputType, Int, Field } from '@nestjs/graphql';
import { FileMetaData } from '../entities/assessment-mitigation_attachments.entity';

@InputType()
export class AssessmentCheckListInput{
  @Field(() => Boolean, { nullable:true,defaultValue: false,description: "checklist id" })
  isChecked: boolean;

  @Field(() => String, {nullable: true, description: "checklist status" })
  checklistTitle: string;
}

@InputType()
export class CreateAssessmentMitigationInput {
  @Field(() => Int, { nullable: true, description: "due diligence id" })
  dueDiligenceId: number;

  @Field(() => Int, { description: "production place id" })
  productionPlaceId: number;

  @Field(() => Int, { description: "assessment id" })
  assessmentId: number;

  @Field(() => Int, { nullable: true, description: "assessment question id" })
  assessmentQuestionId: number;

  @Field(() => Int, { nullable: true, description: "assessment question option id" })
  assessmentQuestionOptionId: number;

  @Field(() => String, {nullable: true, description: "mitigation status" })
  mitigationStatus: string;

  @Field(() => Int, {nullable: true, description: "assigned user" })
  assignedUserId: string;
  
  @Field(() => [AssessmentCheckListInput], {nullable: true, description: "" })
  checkLists:AssessmentCheckListInput[]
  
  @Field(() => Int, { nullable: true })
  assessmentResponseId: number;
  
  @Field(() => Int, { nullable: true })
  userFarmId: number;
}

@InputType()
export class CreateAssessmentMitigationAttachmentsInput {

  @Field(() => String, {nullable: true, description: " comment" })
  filePath: string;

  @Field(() => FileMetaData, {nullable: true, })
  fileMetadata: FileMetaData;
}


@InputType()
export class CreateAssessmentMitigationDiscussionInput {
  @Field(() => Int, { description: "assessment mitigation id" })
  assessmentMitigationId: number;

  @Field(() => String, {nullable: true, description: " comment" })
  comment: string;

  @Field(() => Int, {nullable: true, description: "user" })
  userId: string;
  
  @Field(() => [CreateAssessmentMitigationAttachmentsInput], {nullable: true, description: "" })
  attachments:CreateAssessmentMitigationAttachmentsInput[]
}

