import { Module } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UserSettingsResolver } from './user-settings.resolver';
import { UserSetting } from './entities/user-setting.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserSettingsController } from './user-settings.controller';

@Module({
  controllers: [UserSettingsController],
  imports: [SequelizeModule.forFeature([UserSetting])],
  providers: [UserSettingsResolver, UserSettingsService],
})
export class UserSettingsModule {}
