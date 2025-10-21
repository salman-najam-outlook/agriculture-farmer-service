import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserSettingsService } from './user-settings.service';
import { UserSetting } from './entities/user-setting.entity';
import {
  CreateUserSettingInput,
  UserSettingOutPut,
} from './dto/create-user-setting.input';
import { UpdateUserSettingInput } from './dto/update-user-setting.input';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';
import { RolesAllowed } from 'src/core/decorators/role.decorator';
import { Roles } from 'src/core/roles';

@Resolver(() => UserSetting)
export class UserSettingsResolver {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @RolesAllowed(Roles.ADMIN, Roles.FARMER)
  @Mutation(() => UserSetting)
  async createUserSetting(
    @GetTokenData('userid') userId: number,
    @Args('createUserSettingInput')
    createUserSettingInput: CreateUserSettingInput,
  ) {
    return await this.userSettingsService.create(
      createUserSettingInput,
      userId,
    );
  }

  @Query(() => UserSettingOutPut, { nullable: true, name: 'userSettings' })
  async findAll(
    @GetTokenData('userid') userId: number,
    @Args('userSpecific', {
      type: () => Boolean,
      defaultValue: false,
      nullable: true,
    })
    userSpecific: boolean,
  ) {
    console.log(userSpecific);
    return await this.userSettingsService.findAll(userId, userSpecific);
  }

  // @Query(() => UserSetting, { name: 'userSetting' })
  // async findOne(
  //   @GetTokenData('userid') userId: number,
  //   @Args('id', { type: () => Int }) id: number,
  // ) {
  //   return await this.userSettingsService.findOne(id, userId);
  // }

  @Mutation(() => UserSetting)
  async updateUserSetting(
    @GetTokenData('userid') userId: number,

    @Args('updateUserSettingInput')
    updateUserSettingInput: UpdateUserSettingInput,
  ) {
    return await this.userSettingsService.update(
      updateUserSettingInput.id,
      userId,
      updateUserSettingInput,
    );
  }

  @Mutation(() => Boolean)
  async removeUserSetting(
    @GetTokenData('userid') userId: number,
    @Args('id', { type: () => Int }) id: number,
  ) {
    return await this.userSettingsService.remove(id, userId);
  }
}
