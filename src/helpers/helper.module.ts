import { Global, Module } from '@nestjs/common';
import { ApiCallHelper } from './api-call.helper';
import { S3Service } from '../upload/upload.service';
import { PermissionService } from './permission.service';
import { RedisModule } from '../redis/redis.module';

@Global()
@Module({
  imports: [RedisModule],
  providers: [ApiCallHelper, S3Service, PermissionService],
  exports: [ApiCallHelper, S3Service, PermissionService],
})
export class HelperModule {}
