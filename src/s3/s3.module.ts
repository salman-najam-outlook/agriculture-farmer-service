import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { S3Resolver } from './s3.resolver';
import { S3Controller } from './s3.controller';

@Module({
  providers: [S3Service, S3Resolver],
  exports: [S3Service],
  controllers: [S3Controller],
})
export class S3Module {}