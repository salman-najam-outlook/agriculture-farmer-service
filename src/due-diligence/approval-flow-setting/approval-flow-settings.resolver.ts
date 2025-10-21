import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from "@nestjs/graphql";
import { ApprovalFlowSettingsService } from "./approval-flow-settings.service";
import { ApprovalFlowSetting } from "./entities/approval-flow-settings.entity";
import { CreateApprovalFlowSettingInput } from "./dto/create-approval-flow-settings.input";
import { UpdateApprovalFlowSettingInput } from "./dto/update-approval-flow-settings.input";
import { GetTokenData } from "src/decorators/get-token-data.decorator";

@Resolver(() => ApprovalFlowSetting)
export class ApprovalFlowSettingsResolver {
  constructor(
    private readonly approvalFlowSettingsService: ApprovalFlowSettingsService
  ) {}

  @Mutation(() => ApprovalFlowSetting)
  createApprovalFlowSetting(
    @Args("createApprovalFlowSettingInput")
    @GetTokenData('organizationid') organizationId: number,
    createApprovalFlowSettingInput: CreateApprovalFlowSettingInput
  ) {
    return this.approvalFlowSettingsService.create(
      createApprovalFlowSettingInput,
      organizationId
    );
  }

  @Query(() => [ApprovalFlowSetting], { name: "approvalFlowSettings" })
  findAll() {
    return this.approvalFlowSettingsService.findAll();
  }

  @Query(() => ApprovalFlowSetting, { name: "approvalFlowSetting" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.approvalFlowSettingsService.findOne(id);
  }

  @Query(() => ApprovalFlowSetting, { name: "approvalFlowSettingByOrgId" })
  findByOrgId(@GetTokenData('organizationid') organizationId: number) {
    return this.approvalFlowSettingsService.findByOrgId(organizationId);
  }


  @Mutation(() => ApprovalFlowSetting)
  updateApprovalFlowSettingByOrgId(
    @GetTokenData('organizationid') organizationId: number,
    @Args("updateApprovalFlowSettingInput")
    updateApprovalFlowSettingInput: UpdateApprovalFlowSettingInput
  ) {
    return this.approvalFlowSettingsService.updateByOrgId(
      organizationId,
      updateApprovalFlowSettingInput
    );
  }

  @Mutation(() => Boolean)
    removeApprovalFlowSetting(@Args("id") id: number) {
    return this.approvalFlowSettingsService.remove(id);
  }

  // Resolve fields for additional computed properties
  @ResolveField(() => String, { name: "formattedExpirationPeriod" })
  getFormattedExpirationPeriod(@Parent() setting: ApprovalFlowSetting) {
    if (
      !setting.approval_expiration_period ||
      !setting.approval_expiration_unit
    ) {
      return "Not set";
    }
    const unit =
      setting.approval_expiration_unit === "days"
        ? "day"
        : setting.approval_expiration_unit === "weeks"
        ? "week"
        : "month";
    const plural = setting.approval_expiration_period > 1 ? "s" : "";
    return `${setting.approval_expiration_period} ${unit}${plural}`;
  }

  @ResolveField(() => String, { name: "documentVisibilityDescription" })
  getDocumentVisibilityDescription(@Parent() setting: ApprovalFlowSetting) {
    switch (setting.document_visibility) {
      case "private":
        return "Visible only to admins; hidden from all cooperatives and users.";
      case "cooperative_and_ptsi_only":
        return "Visible only to the assigned cooperative and platform administrators.";
      case "public":
        return "Visible to everyone, including all users and the general public.";
      default:
        return "Visibility not set.";
    }
  }
}
