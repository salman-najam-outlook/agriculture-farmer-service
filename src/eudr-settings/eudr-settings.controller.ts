import { Controller, Get } from "@nestjs/common";
import { GetTokenData } from "src/decorators/get-token-data.decorator";
import { EudrSettingsService } from "./eudr-settings.service";

@Controller("api/eudr-setting")
export class EudrSettingController {
  constructor(
   private readonly eudrSettingsService: EudrSettingsService
  ) {}

  @Get('/')
  findOne(@GetTokenData("organizationid") organizationId: number) {
    return this.eudrSettingsService.findOne(organizationId);
  }
}