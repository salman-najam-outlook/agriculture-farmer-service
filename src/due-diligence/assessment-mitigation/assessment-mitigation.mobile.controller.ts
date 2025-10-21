import { Controller, Get, Put, Param, Body, Query, Post } from "@nestjs/common";
import { AssessmentMitigation } from "./entities/assessment-mitigation.entity";
import { UpdateAssessmentMitigationInput } from "./dto/update-assessment-mitigation.input";
import { AssessmentMitigationService } from "./assessment-mitigation.service";
import { CreateAssessmentMitigationDiscussionInput, CreateAssessmentMitigationInput } from "./dto/create-assessment-mitigation.input";

@Controller("api/assessment-mitigation")
export class AssessmentMitigationMobileController {
  constructor(
    private readonly assessmentMitigationService: AssessmentMitigationService
  ) {}

  @Post("/")
  createAssessmentMitigation(
    @Body() createAssessmentMitigationInput: CreateAssessmentMitigationInput
  ): Promise<AssessmentMitigation> {
    return this.assessmentMitigationService.createOrFind(
      createAssessmentMitigationInput
    );
  }

  @Get("farms/:userFarmId/assessmentId/:assessmentId/assessmentQuestionId/:questionId")
  async getAssessmentMitigation(
    @Param("userFarmId") userFarmId: number,
    @Param("assessmentId") assessmentId: number,
    @Param("questionId") assessmentQuestionId: number
  ) {
    if (!userFarmId) {
      throw Error("Farm Id not provided in route!");
    }

    if (!assessmentId) {
      throw Error("Assessment Id not provided in route!");
    }

    return this.assessmentMitigationService.findOneForQuestion(userFarmId, assessmentId, assessmentQuestionId);
  }

  @Put(":id")
  updateAssessmentMitigation(
    @Param("id") id: number,
    @Body() updateAssessmentMitigationInput: UpdateAssessmentMitigationInput
  ): Promise<AssessmentMitigation> {
    return this.assessmentMitigationService.update(
      id,
      updateAssessmentMitigationInput
    );
  }

  @Get("discussions/:mitigationId")
  async findAllDiscussions(
    @Param('mitigationId') mitigationId: number
  ) {
    return await this.assessmentMitigationService.findAllDiscussions(mitigationId);
  }

  @Post("discussions")
  async createDiscussion(
    @Body() createAssessmentMitigationDiscussionInput: CreateAssessmentMitigationDiscussionInput
  ) {
    return await this.assessmentMitigationService.addMitigationDiscussion(createAssessmentMitigationDiscussionInput);
  }
}
