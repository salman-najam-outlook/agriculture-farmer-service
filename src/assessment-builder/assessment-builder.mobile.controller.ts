import { Controller, Post, Get, Body, Query, Headers, Param, ParseIntPipe } from "@nestjs/common";
import { CreateSurveyResponseInput } from "./dto/create-assessment-response.input";
import { AssessmentSurvey } from "./entities/assessment-survey.entity";
import { GetTokenData } from "src/decorators/get-token-data.decorator";
import { AssessmentBuilderMobileService } from "./assessment-builder.mobile.service";
import { FarmsService } from "src/farms/farms.service";
import { UserDDS } from "src/users/entities/dds_user.entity";
import { User } from "src/users/entities/user.entity";

@Controller("api/assessment-builder")
export class AssessmentBuilderMobileController {
  constructor(
    private readonly farmService: FarmsService,
    private readonly assessmentBuilderService: AssessmentBuilderMobileService,
  ) {}

  @Get('assessments')
  async fetchReportsByUserId(
    @GetTokenData('cf_userid') tokenUserId: number,
    @GetTokenData('userid') tokenUserDdsId: number,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('userId') queryUserId?: number,
  ) {
    const userId = queryUserId || tokenUserId;

    const queryUserDdsId = queryUserId ? await UserDDS.findOne({
      where: { cf_userid: queryUserId }
    }).then(ddsUser => ddsUser?.id) || await User.findOne({
      where: { cf_userid: queryUserId }
    }).then(user => user?.id) : undefined;

    const userDdsId = userId === tokenUserId ? tokenUserDdsId : queryUserDdsId;

    if (!userId) {
      throw Error("Failed to find assessments, user id not provided!");
    } 

    if (page === null || limit === null || page < 1 || limit < 1) {
      throw Error("No pagination information provided in query, required 'offset' and 'limit' values");
    }

    return await this.assessmentBuilderService.findAssessmentByUser({userId}, userDdsId, {
      offset: (page - 1) * limit,
      limit
    });
  }
  
  @Post("responses")
  async saveSurveyResponseMobile(
    @GetTokenData('userid') userId: number,
    @GetTokenData('cf_userid') cfUserId: number,
    @Headers() headers,
    @Body() createSurveyResponseInput: CreateSurveyResponseInput
  ): Promise<AssessmentSurvey> {
    const cfFarmId = createSurveyResponseInput.cfFarmId;
    let surveyFarm = await this.farmService.findByCfFarmId(cfFarmId, cfUserId);
    if (!surveyFarm) { // Create farm if not exists
      const token = headers["oauth-token"];
      let farmValidated = false;
      if (token) {
        surveyFarm = await this.farmService.pullFarmFromCF(userId, cfFarmId, token);
        farmValidated = surveyFarm !== null;
      }
      if (!farmValidated) throw Error(`Could not find or fetch farm for farm ID ${cfFarmId}`); 
    }
    createSurveyResponseInput.userFarmId = surveyFarm.id;
    createSurveyResponseInput.submittedBy = cfUserId;
    return this.assessmentBuilderService.saveResponse(createSurveyResponseInput);
  }

  @Post("responses/user/:userId")
  async saveSurveyResponseUserMobile(
    @GetTokenData('cf_userid') cfUserId: number,
    @Param("userId") userIdParam: number,
    @Headers() headers,
    @Body() createSurveyResponseInput: CreateSurveyResponseInput
  ): Promise<AssessmentSurvey> {
    createSurveyResponseInput.submittedBy = cfUserId;
    const userId = await UserDDS.findOne({
        where: { cf_userid: userIdParam }
      }).then(ddsUser => ddsUser?.id) || await User.findOne({
        where: { cf_userid: userIdParam }
      }).then(user => user?.id);
    
    const cfFarmId = createSurveyResponseInput.cfFarmId;
    let surveyFarm = await this.farmService.findByCfFarmId(cfFarmId, userIdParam);
    if (!surveyFarm) { // Create farm if not exists
      const token = headers["oauth-token"];
      let farmValidated = false;

      if (token) {
        surveyFarm = await this.farmService.pullFarmFromCF(userId, cfFarmId, token);
        farmValidated = surveyFarm !== null;
      }

      if (!farmValidated) throw Error(`Could not find or fetch farm for farm ID ${cfFarmId}`); 
    }

    createSurveyResponseInput.userFarmId = surveyFarm.id;
    return this.assessmentBuilderService.saveResponse(createSurveyResponseInput);
  }

  @Get('pending-assessments-count/farm/:farmId/user/:userId')
  async getPendingAssessmentsCount(@Param('farmId', ParseIntPipe) farmId: number, @Param('userId', ParseIntPipe) userId: number): Promise<{ count: number }> {
    let surveyFarms = await this.farmService.findAllByCfFarmId(farmId);
    const count = await this.assessmentBuilderService.getPendingAssessmentsCount(surveyFarms, userId);
    return { count };  
  }
}
