import { Injectable } from '@nestjs/common';
import { CreateUserSettingInput } from './dto/create-user-setting.input';
import { UpdateUserSettingInput } from './dto/update-user-setting.input';
import { InjectModel } from '@nestjs/sequelize';
import { UserSetting } from './entities/user-setting.entity';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectModel(UserSetting) private userSettingRepository: typeof UserSetting,
  ) {}

  async create(
    createUserSettingInput: CreateUserSettingInput,
    userId: number,
  ): Promise<UserSetting> {
    try {
      const existingSetting = await this.userSettingRepository.findOne({
        where: { userId },
      });
      let userSetting = null;
      if (!existingSetting) {
        userSetting = await this.userSettingRepository.create({
          ...createUserSettingInput,
          userId,
        });
        return userSetting;
      } else {
        await this.update(existingSetting.id, userId, {
          ...existingSetting,
          ...createUserSettingInput,
        });
      }
      return this.findOne(existingSetting?.id || userSetting.id, userId);
    } catch (error) {
      console.log('User Setting create error ==>', error);
      throw new Error(error.message);
    }
  }

  async findAll(userId: number, userSpecific: boolean) {
    if (!userSpecific)
      return {
        userId: userId,
        language: 'en',
        weightUnit: 'KG',
      };
    let where: any = {
      userId,
    };

    const data = await this.userSettingRepository.findOne({
      where,
    });

    return {
      userId: userId,
      language: data?.language || 'en',
      weightUnit: data?.weightUnit || 'KG',
    };
  }

  async findOne(id: number, userId: number) {
    const userSetting = await this.userSettingRepository.findOne({
      where: { id: id, userId: userId },
    });

    if (!userSetting) {
      throw new Error('User Settings data not found');
    }

    return userSetting;
  }

  async update(
    id: number,
    userId: number,
    updateUserSettingInput: UpdateUserSettingInput,
  ) {
    try {
      await this.userSettingRepository.update(
        { ...updateUserSettingInput, userId },
        { where: { id } },
      );

      return this.findOne(id, userId);
    } catch (error) {
      console.log('User Setting update =>', error);
      throw error;
    }
  }

  async remove(id: number, userId: number) {
    await this.userSettingRepository.destroy({
      where: { id: id, userId: userId },
    });
    return true;
  }
}
