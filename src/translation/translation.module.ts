// src/translation/translation.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TranslationService } from './translation.service';
import { Translation } from './translation.entity';

@Module({
  imports: [SequelizeModule.forFeature([Translation])],
  providers: [TranslationService],
  exports: [TranslationService],
})
export class TranslationModule {}