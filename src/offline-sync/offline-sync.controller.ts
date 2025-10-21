import { Controller, Post, Body, Headers } from "@nestjs/common";
import { OfflineSyncService } from "./offline-sync.service";

@Controller("api/sync")
export class OfflineSyncController {
  constructor(
    private readonly offlineSyncService: OfflineSyncService
  ) {}

  @Post('/')
  async syncData(
    @Body() apiData: any[],
    @Headers('oauth-token') token: string,
    @Headers('lang') lang: string = 'en',
    @Headers('app_version_code') appVersionCode: string,
    @Headers('app_package_name') appPackageName: string,
    @Headers('app_version_name') appVersionName: string,
  ) {
    return await this.offlineSyncService.sync(apiData, {
      token,
      lang,
      appVersionCode,
      appPackageName,
      appVersionName,
    });
  }
}
