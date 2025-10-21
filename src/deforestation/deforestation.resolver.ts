import { Resolver, Query, Mutation, Args, Int, Context } from "@nestjs/graphql";
import { DeforestationService } from "./deforestation.service";
import { DeforestationReportRequest } from "./entities/deforestation_report_request.entity";
import {
  CreateDeforestationInput,
  DeforestationPagination,
  GetCertificateInput,
  GetDeforestationInput,
  GetCertificateInputAdmin,
  ReportStatus,
  AdminDisplayType,
  AverageProb,
  EUDRDeforestationStatusInput,
  UpdateEUDRDeforestationStatusResponse,
  RequestCertificateForUserInput,
  DetectDeforestationBulkInput,
} from "./dto/create-deforestation.input";
import { GetTokenData } from "src/decorators/get-token-data.decorator";
import { DueDiligenceProductionPlacesPyData } from "./entities/due_diligence_production_places_py_data.entity";

@Resolver(() => DeforestationReportRequest)
export class DeforestationResolver {
  constructor(private readonly deforestationService: DeforestationService) {}

  @Mutation(() => String)
  async createDeforestation(
    @GetTokenData("lang") lang: string,
    @GetTokenData("userid") userId: number,
    @Args("createDeforestationInput")
    createDeforestationInput: CreateDeforestationInput
  ) {
    return await this.deforestationService.create(
      createDeforestationInput,
      userId,
      lang ?? 'en',
    );
  }

  @Query(() => [AverageProb!], { name: "overAllProb" })
  async findOverallProb(
    @GetTokenData("lang") lang: string,
    @GetTokenData("userid") userId: number,
    @Args("getDeforestationInput")
    getDeforestationInput: GetCertificateInputAdmin
  ) {
    return await this.deforestationService.findAllProb({
      ...getDeforestationInput,
      lang,
    });
  }

  /** Resolver for Admin  */
  @Query(() => DeforestationPagination, { name: "deforestationAdmin" })
  async findAllForAdmin(
    @GetTokenData("lang") lang: string,
    @GetTokenData("userid") userId: number,
    @Args("getDeforestationInput")
    getDeforestationInput: GetCertificateInputAdmin
  ) {
    return await this.deforestationService.findAllForAdmin({
      ...getDeforestationInput,
      lang: lang ?? 'en',
    });
  }

  @Query(() => DeforestationPagination, { name: "deforestations" })
  async findAll(
    @GetTokenData("lang") lang: string,
    @GetTokenData("userid") userId: number,
    @Args("getDeforestationInput")
    getDeforestationInput: GetDeforestationInput
  ) {
    return await this.deforestationService.findAll(userId, {
      ...getDeforestationInput,
    }, false, false, lang);
  }

  @Query(() => DeforestationPagination, { name: "assessmentReports" })
  async findAllAssessmentReprots(
    @GetTokenData("lang") lang: string,
    @GetTokenData("userid") userId: number,
    @Args("getDeforestationInput")
    getDeforestationInput: GetDeforestationInput
  ) {
    return await this.deforestationService.findAll(
      userId,
      {
        ...getDeforestationInput,
      },
      true,
      true,
      lang,
    );
  }

  @Query(() => DeforestationReportRequest, { name: "deforestation" })
  async findOne(
    @GetTokenData("lang") lang: string,
    @Args("id", { type: () => Int }) id: number
  ) {
    return await this.deforestationService.findOne(id, undefined, lang);
  }

  @Query(() => String, { name: "getImageLinkFromHash" })
  async getImageLinkFromHash(
    @Args("imageHash", { type: () => String }) imageHash: string
  ) {
    return await this.deforestationService.getImageLinkFromHash(imageHash);
  }

  @Mutation(() => String)
  async requestComplianceCertificate(
    @GetTokenData("userid") userId: number,
    @GetTokenData("lang") lang:string,
    @Args("reportId", { type: () => Int })
    reportId: number
  ) {
    return await this.deforestationService.requestComplianceCertificate(
      reportId,
      userId,
      lang ?? 'en'
    );
  }

  @Mutation(() => String)
  async requestComplianceCertificateForUser(
    @GetTokenData("lang") lang:string,
    @Args("requestCertificateForUserInput")
    requestCertificateForUserInput: RequestCertificateForUserInput
  ) {
    return await this.deforestationService.requestComplianceCertificate(
      requestCertificateForUserInput.reportId,
      requestCertificateForUserInput.userId,
      lang ?? 'en'
    );
  }

  @Query(() => DeforestationPagination, { name: "certificates" })
  async certificates(
    @GetTokenData("lang") lang: string,
    @GetTokenData("userid") userId: number,
    @Args("getCertificateInput")
    getCertificateInput: GetCertificateInput
  ) {
    return await this.deforestationService.findAll(
      userId,
      {
        ...getCertificateInput,
        isCertified: true,
        status: ReportStatus.CERTIFICATE_READY,
      },
      true,
      false,
      lang,
    );
  }
  // @Query(() => String, { name: "testbc" })
  // async testBc() {
  //   return await this.deforestationService.testBC();
  // }

  @Query(() => DeforestationReportRequest, { name: "deforestationByFarmid", nullable: true })
  async getDeforestationDetailByFarmId(
    @GetTokenData("lang") lang: string,
    @Args("farmId", { type: () => Int }) farmId: number,
  ) {
    return await this.deforestationService.deforestationByFarmId(farmId, lang);
  }

  @Mutation(()=> UpdateEUDRDeforestationStatusResponse, { name: "updateEUDRDeforestationStatus"})
  async updateEUDRDeforestationStatus(
    @Args('eudrDeforestationStatusInput', { type: () => [EUDRDeforestationStatusInput] }) eudrDeforestationStatusInput: EUDRDeforestationStatusInput[]
  ) {
    return await this.deforestationService.updateEUDRBulkStatus(eudrDeforestationStatusInput);
  }

  @Query(() => [DueDiligenceProductionPlacesPyData], { name: "detectDeforestationBulk", nullable: true })
  async detectDeforestationBulk(
    @Args("detectDeforestationBulkInput", { type: () => [DetectDeforestationBulkInput] })
    detectDeforestationBulkInput: DetectDeforestationBulkInput[]
  ) {
    return await this.deforestationService.detectDeforestationBulk(detectDeforestationBulkInput);
  }
}
