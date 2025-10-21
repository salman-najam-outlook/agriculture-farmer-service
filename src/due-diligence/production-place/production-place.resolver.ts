import { Args, Context, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ProductionPlaceService } from "./production-place.service";
import {
  CreateProductionPlacesInput, DueDiligenceProductionPlaceExtended,
  ProductionPlaceFilterInput, ProductionPlaceListPaginatedResponse,
  RemoveFarmArgs,
  RestoreFarmsArgs,
  CreateProductionPlaceResponse,
  RemoveFarmResponse,
  UpdateProductionPlacesInput,
  GeneralResponseFormat,
  RiskAssessmentStatusInput,
  UpdateEUDRDeforestationStatusInput,
  ProducersPaginatedResponse,
  ProducerEditInput,
  ProducerAddInput,
  ProducersFilterInput,
  ProducerEditResponse,
  RemoveUnapprovedFarmArgs,
  DiligenceReportConcludeStatusInput,
  ConcludeDigelienceReportWarings
} from "./dto/create-production-place.input";
import { GetTokenData } from "src/decorators/get-token-data.decorator";
import { DueDiligenceProductionPlace } from "./entities/production-place.entity";
import {HighRiskFarmMitigationInput, MitigateProductionPlaceInput, UpdateManuallyMitigationInput, UpdateRiskMitigationInput} from "./dto/risk-mitigation-file.input";
import {
  DisputeCommentInput,
  ProductionPlaceDisputeFilterInput,
  ProductionPlaceDisputeInput,
  ProductionPlaceDisputePaginatedResponse,
  UpdateProductionPlaceDisputeInput
} from "./dto/production-place-dispute.input";
import {ProductionPlaceDisputes} from "./entities/production-place-dispute.entity";
import {ProductionPlaceDisputeComments} from "./entities/dispute-comment.entity";
import { UserDDS as User } from "src/users/entities/dds_user.entity";
import { ProductionPlaceWarningService } from './production-place-warning.service'

@Resolver(()=>DueDiligenceProductionPlace)
export class ProductionPlaceResolver {
  constructor(
    private readonly productionPlaceService: ProductionPlaceService,
    private readonly productionPlaceWarningService:ProductionPlaceWarningService
  ) {}

  @Mutation(() => CreateProductionPlaceResponse  , { name: "createProductionPlaces" })
  async createProductionPlaces(
    @GetTokenData("authorization") authorization: string,
    @GetTokenData("userid") userId: number,
    @GetTokenData("organizationid") organizationId: number,
    @Args("createProductionPlacesInput") createProductionPlacesInput: CreateProductionPlacesInput,
    @GetTokenData('subOrganizationId') subOrganizationId?: number
  ): Promise<Object> {
    return await this.productionPlaceService.createProductionPlace(
      createProductionPlacesInput,
      authorization,
      userId,
      organizationId,
      subOrganizationId
    );
  }

  /**
   *
   * @param authorization
   * @param userId
   * @param updateProductionPlacesInput
   * @returns
   */
  @Mutation(() => CreateProductionPlaceResponse  , { name: "updateDueDiligenceReport" })
  async updateDueDiligenceReport(
    @GetTokenData("authorization") authorization: string,
    @GetTokenData("userid") userId: number,
    @GetTokenData("organizationid") organizationId: number,
    @Args("updateProductionPlacesInput")
    updateProductionPlacesInput: UpdateProductionPlacesInput
  ){
    return await this.productionPlaceService.updateDueDiligenceReport(updateProductionPlacesInput, authorization, userId, organizationId);
  }

  @Query(() => ProducersPaginatedResponse, { name: 'getProducers' })
  async getProducers(
    @Args('filter', { nullable: true }) filter?: ProducersFilterInput,
    @GetTokenData('organizationid') organizationId?: number,
    @GetTokenData('subOrganizationId') subOrganizationId?: number,
    @GetTokenData('userid') userId?: number,
  ) {
    return this.productionPlaceService.findAllProducers(filter, organizationId, userId,subOrganizationId);
  }

  @Mutation(() => ProducerEditResponse, { name: 'addProducer' })
  async addProducer(
    @Args("producerInput") producerInput: ProducerAddInput,
    @GetTokenData('organizationid') organizationId?: number,
    @GetTokenData('userid') userId?: number,
    @GetTokenData("authorization") authorization?: string,
    @GetTokenData('subOrganizationId') subOrganizationId?: number,
  ) {
     await this.productionPlaceService.addProducer(producerInput, organizationId, userId, authorization,subOrganizationId);
     return {
        message:'Add success',
        success:true
     }
  }


  @Mutation(() => ProducerEditResponse, { name: 'editProducer' })
  async editProducers(
    @Args("producerInput") producerInput: ProducerEditInput,
    @GetTokenData('organizationid') organizationId?: number,
    @GetTokenData("authorization") authorization?: string,

  ) {
     await this.productionPlaceService.editProducer(producerInput, authorization);
     return {
        message:'Edit success',
        success:true
     }
  }

  @Mutation(() => ProducerEditResponse, { name: 'deleteProducer' })
  async deleteProducer(
    @Args("producerInput") producerInput: ProducerEditInput,
    @GetTokenData('organizationid') organizationId?: number,
    @GetTokenData("authorization") authorization?: string,
  ) {
    const { id } = producerInput
     await this.productionPlaceService.deactivateUser(id, authorization);
     return {
        message:'Edit success',
        success:true
     }
  }

  @Query(() => ProductionPlaceListPaginatedResponse)
  async productionPlaces(
      @Context() context: any,
      @Args('filter', { nullable: true }) filter?: ProductionPlaceFilterInput,
      @GetTokenData('organizationid') organizationId?: number,
      @GetTokenData('subOrganizationId') subOrganizationId?: number,
  ) {
    return this.productionPlaceService.findAll(filter, organizationId, context,subOrganizationId);
  }

  @Query(()  => ConcludeDigelienceReportWarings, {name:'concludeDigilienceReportStatus'})
  async concludeDigilienceReportStatus(
    @GetTokenData('organizationid') organizationId: number,
    @Args('filter', { nullable: false }) filter?: DiligenceReportConcludeStatusInput,
  ){
    return await this.productionPlaceWarningService.concludeReportNonComplaint(filter.reportId)
  }


  @Query(() => DueDiligenceProductionPlaceExtended, { name: "productionPlace" })
  async getProductionPlace(@Args("id", { type: () => Int }) id: number) {
    return this.productionPlaceService.findOne(id);
  }

  @Query(() => DueDiligenceProductionPlaceExtended, { name: "productionPlaceByCfFarmid", nullable: true })
  async getProductionPlaceByCfFarmId(
    @GetTokenData("lang") lang: string,
    @Args("cfFarmId", { type: () => Int }) cfFarmId: number,
  ) {
    return await this.productionPlaceService.findByCfFarmId(cfFarmId, lang);
  }

  @Mutation(() => String)
  async productionPlaceRiskMitigation(
    @Args("input") input: UpdateRiskMitigationInput
  ) {
    return this.productionPlaceService.riskMitigation(input);
  }

  @Mutation(() => String)
  async productionPlaceManuallyMitigated(
    @Args("input", { type: () => [UpdateManuallyMitigationInput] }) input: [UpdateManuallyMitigationInput]
  ) {
    return this.productionPlaceService.manuallyMitigated(input);
  }

  @Mutation(() => String, { name: "removeRiskMitigationFile" })
  async removeRiskMitigationFile(
    @Args("productionPlaceId", { type: () => Int }) productionPlaceId: number,
    @Args("fileId", { type: () => Int }) fileId: number,
  ): Promise<string> {
    return this.productionPlaceService.removeRiskMitigationFile(productionPlaceId, fileId);
  }
  @Mutation(() => String, { name: "removeManuallyMitigatedFile" })
  async removeManuallyMitigatedFile(
    @Args("id", { type: () => Int }) id: number,
  ): Promise<string> {
    return this.productionPlaceService.removeManuallyMitigatedFile(id);
  }
  
  @Mutation(() => RemoveFarmResponse, { name: "removeUnapprovedFarmFromProductionPlaceList" })
  async removeUnapprovedFarmFromProductionPlaceList(
      @Args() args: RemoveUnapprovedFarmArgs,
  ): Promise<{success:boolean, message:string}> {
    return this.productionPlaceService.removeUnacceptedFarms(args);
  }

  @Mutation(() => RemoveFarmResponse)
  async removeFarmFromProductionPlaceList(
      @Args() args: RemoveFarmArgs,
  ): Promise<{success:boolean, message:string}> {
    return this.productionPlaceService.removeFarms(args);
  }


  @Mutation(() => RemoveFarmResponse)
  async updateDisregardStatusForAssessmentProductionPlace(
    @Args('dueDiligenceReportId', { type: () => Int }) dueDiligenceReportId: number,
    @Args('assessmentId', { type: () => Int }) assessmentId: number,
  ): Promise<{success:boolean, message:string}> {
    return await this.productionPlaceService.updateDisregardStatus(dueDiligenceReportId, assessmentId);
  }

  @Mutation(() => String)
  async restoreFarmToProductionPlaceList(
      @Args() args: RestoreFarmsArgs,
  ): Promise<string> {
    return this.productionPlaceService.restoreFarms(args);
  }

  @Mutation(()=>RemoveFarmResponse)
  async highRiskFarmsRiskMitigation(
      @Args("input") input: HighRiskFarmMitigationInput,
      @GetTokenData('organizationid') orgId: number,
  ){
    return this.productionPlaceService.highRiskFarmRisksMitigation(input, orgId)
  }

  @Mutation(()=>RemoveFarmResponse)
  async highRiskAssessmentMitigation(
    @Args('input') input: MitigateProductionPlaceInput,
  ){
    return this.productionPlaceService.mitigateHighRiskAssessmentProductionPlace(input)
  }

  @Mutation(()=>ProductionPlaceDisputes)
  async createDispute(
      @Args("input") input: ProductionPlaceDisputeInput,
      @GetTokenData('userid') userId: number,
      @GetTokenData('organizationid') organizationId: number,
  ){
    return this.productionPlaceService.createProductionPlaceDispute(input, organizationId, userId)
  }

  @Mutation(()=>ProductionPlaceDisputes)
  async updateDispute(
      @Args("id", { type: () => Int, nullable: false }) id: number,
      @Args("input") input: UpdateProductionPlaceDisputeInput
  ){
    return this.productionPlaceService.updateProductionPlaceDispute(id, input)
  }
  @Mutation(()=>ProductionPlaceDisputes)
  async deleteDispute(
      @Args("id", { type: () => Int, nullable: false }) id: number,
  ){
    console.log("resolver",id)
    return this.productionPlaceService.deleteProductionPlaceDispute(id)
  }

  @Mutation(()=>ProductionPlaceDisputeComments)
  async createDisputeComment(
      @Args("input") input: DisputeCommentInput,
      @GetTokenData('userid') userId: number
  ){
    return this.productionPlaceService.createProductionPlaceDisputeComment(input, userId)
  }

  @Query(() => ProductionPlaceDisputes)
  async findOneDispute(
    @Args('id', { nullable: false, type: () => Int }) id: number
  ) {
    return this.productionPlaceService.findOneDispute(id);
  }


  @Query(() => ProductionPlaceDisputePaginatedResponse)
  async findProductionPlaceDisputes(
      @GetTokenData('organizationid') organizationId: number,
      @GetTokenData("subOrganizationId") subOrganizationId,
      @Args('filter', { nullable: false }) filter?: ProductionPlaceDisputeFilterInput,
  ) {
    return this.productionPlaceService.findProductionPlaceDisputes(filter, organizationId,subOrganizationId);
  }

  @Mutation(()=> GeneralResponseFormat, { name: "updateRiskAssessmentStatus"})
  async updateRiskAssessmentStatus(
    @GetTokenData('organizationid') organizationId: number,
    @Args('riskAssessmentStatusInput', { type: () => RiskAssessmentStatusInput }) riskAssessmentStatusInput: RiskAssessmentStatusInput
  ) {
    return await this.productionPlaceService.updateRiskAssessmentStatus(riskAssessmentStatusInput, organizationId);
  }

  @Mutation(()=>GeneralResponseFormat, { name: "updateManualEUDRDeforestationStatus"})
  async updateEUDRDeforestationStatus(
    @Args("updateEudrDeforestationStatusInput", { type: ()=>UpdateEUDRDeforestationStatusInput}) updateEudrDeforestationStatusInput: UpdateEUDRDeforestationStatusInput
  ){
    return await this.productionPlaceService.updateEUDRAssessmentStatus(updateEudrDeforestationStatusInput);
  }

  @Mutation(() => GeneralResponseFormat)
  async checkPolygonOverlap(
    @Args('id', { nullable: false, type:()=> Int }) id: number,
    @GetTokenData('organizationid') organizationId?: number,
  ): Promise<GeneralResponseFormat> {
    return this.productionPlaceService.checkPolygonOverlap(id, organizationId);
  }
}
