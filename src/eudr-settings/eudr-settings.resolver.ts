import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { EudrSettingsService } from './eudr-settings.service';
import { EudrSetting } from './entities/eudr-setting.entity';
import { CreateEudrSettingInput } from './dto/create-eudr-setting.input';
import {UpdateEudrSettingInput } from './dto/update-eudr-declaration.input';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';

@Resolver(() => EudrSetting)
export class EudrSettingsResolver {
  constructor(private readonly eudrSettingsService: EudrSettingsService) {}

  @Mutation(() => EudrSetting)
  async createEudrSetting(
    @Args('createEudrSettingInput') createEudrSettingInput: CreateEudrSettingInput,
    @GetTokenData("organizationid") organizationId: number,
  ) {
    return await this.eudrSettingsService.create(createEudrSettingInput, organizationId);
  }

  @Mutation(() => EudrSetting)
  async updateEudrSetting(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateEudrSettingInput') updateEudrSettingInput: UpdateEudrSettingInput
  ): Promise<EudrSetting> {
    return await this.eudrSettingsService.updateEudrSetting(id, updateEudrSettingInput);
  }

  @Query(() => EudrSetting, { name: 'eudrSettings' })
  findAll() {
    return this.eudrSettingsService.findAll();
  }

  @Query(() => EudrSetting, { name: 'eudrSetting', nullable: true })
  async findOne(@GetTokenData("organizationid") organizationId: number) {
    try {
      return await this.eudrSettingsService.findOne(organizationId);
    } catch (error) {
      console.error('Error in eudrSetting query:', error);
      throw error;
    }
  }
}
