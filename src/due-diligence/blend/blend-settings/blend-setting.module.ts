import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BlendSettingsService } from './services/blend.service';
import { BulkUploadController, BlendSettingsPdfController } from './controllers/blend.controller';
import { BlendSettingsResolver } from './resolvers/blend.resolver';
import { BlendSettings } from './entities/blend-settings.entity';
import { BlendBulkUploadHistoryResolver } from './resolvers/bulkUploadHistory.resolver';
import { BlendBulkUploadHistoryService } from './services/bulkUploadHistory.service';
import { BlendBulkUploadHistory } from './entities/blend-bulk-upload-history.entity';
import { BulkUploadService } from './services/bulkUpload.service';
import { S3Service } from './utils/s3upload';
import { BlendSettingProduct } from './entities/blend-setting-product.entity';


@Module({
  imports: [SequelizeModule.forFeature([BlendSettings, BlendBulkUploadHistory,BlendSettingProduct])],
  providers: [ BlendSettingsService, BlendSettingsResolver, BlendBulkUploadHistoryResolver,BlendSettings, BlendBulkUploadHistoryService, BulkUploadService, S3Service],
  controllers: [BulkUploadController, BlendSettingsPdfController],
  exports: [BlendSettingsService, BlendBulkUploadHistoryService, BulkUploadService, S3Service],
})
export class BlendSettingsModule {}
