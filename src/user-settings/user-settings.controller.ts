import { Controller, Get } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { UserSettingsService } from './user-settings.service';



@Controller()
export class  UserSettingsController {
  constructor(
    private readonly userSettingsService: UserSettingsService
    ) {}

  @Get()
  hello(): string {
    console.log("hellohellohellohellohello")
    return 'This action returns all cats';
  }

  @MessagePattern({ cmd: 'epd_get_user_setting' })
  async accumulate(filter):Promise<any> {
    console.log("epd_get_user_setting")

    const { userId} = filter;
    const userSetting =  await this.userSettingsService.findAll(userId, true);
    return userSetting;

  }

}
