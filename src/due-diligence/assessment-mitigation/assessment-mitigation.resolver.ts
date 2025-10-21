import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AssessmentMitigationService } from './assessment-mitigation.service';
import { AssessmentMitigation } from './entities/assessment-mitigation.entity';
import { CreateAssessmentMitigationDiscussionInput, CreateAssessmentMitigationInput } from './dto/create-assessment-mitigation.input';
import { UpdateAssessmentMitigationInput } from './dto/update-assessment-mitigation.input';
import { AssessmentMitigationDiscussions } from './entities/assessment-mitigation_discussions.entity';
import { AssessmentMitigationAttachments } from './entities/assessment-mitigation_attachments.entity';

@Resolver(() => AssessmentMitigation)
export class AssessmentMitigationResolver {
  constructor(private readonly assessmentMitigationService: AssessmentMitigationService) {}

  @Mutation(() => AssessmentMitigation)
  createAssessmentMitigation(@Args('createAssessmentMitigationInput') createAssessmentMitigationInput: CreateAssessmentMitigationInput) {
    return this.assessmentMitigationService.create(createAssessmentMitigationInput);
  }

  // @Query(() => [AssessmentMitigation], { name: 'assessmentMitigation' })
  // findAll() {
  //   return this.assessmentMitigationService.findAll();
  // }

  @Query(() => AssessmentMitigation, { name: 'assessmentMitigation' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.assessmentMitigationService.findOne(id);
  }

  @Mutation(() => AssessmentMitigation)
  updateAssessmentMitigation(@Args('updateAssessmentMitigationInput') updateAssessmentMitigationInput: UpdateAssessmentMitigationInput) {
    return this.assessmentMitigationService.update(updateAssessmentMitigationInput.id, updateAssessmentMitigationInput);
  }

  // @Mutation(() => AssessmentMitigation)
  // removeAssessmentMitigation(@Args('id', { type: () => Int }) id: number) {
  //   return this.assessmentMitigationService.remove(id);
  // }


  @Mutation(() => AssessmentMitigationDiscussions)
  addMitigationDiscussion(@Args('createAssessmentMitigationDiscussionInput') createAssessmentMitigationDiscussionInput: CreateAssessmentMitigationDiscussionInput) {
    return this.assessmentMitigationService.addMitigationDiscussion(createAssessmentMitigationDiscussionInput);
  }


  @Query(() => [AssessmentMitigationAttachments], { name: 'assessmentMitigationAttachments' })
  assessmentMitigationAttachments(@Args('assessmentMitigationId', { type: () => Int }) assessmentMitigationId: number) {
    return this.assessmentMitigationService.findAllAttachments(assessmentMitigationId);
  }

  @Query(() => [AssessmentMitigationDiscussions], { name: 'assessmentMitigationDiscussions' })
  assessmentMitigationDiscussions(@Args('assessmentMitigationId', { type: () => Int }) assessmentMitigationId: number) {
    return this.assessmentMitigationService.findAllDiscussions(assessmentMitigationId);
  }
}
