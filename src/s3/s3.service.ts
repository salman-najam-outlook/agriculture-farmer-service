import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      region: this.configService.get<string>('AWS_REGION_PUBLIC_BUCKET_REGION'),
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
    });
  }

  async getPreSignedUrl(params: {
    objectName: string;
    mimeType?: string;
    isPrivate: boolean;
    action: 'get' | 'put';
    moduleName: string;
    userId: number;
  }): Promise<string> {
    const { objectName, mimeType, isPrivate, action, moduleName, userId } = params;

    const bucket = isPrivate
      ? process.env.APP_AWS_BUCKET
      : process.env.APP_AWS_BUCKET

    const key = `dds_user_data/${moduleName.trim() || `default_${userId}`}/${objectName}`;
    const s3Params: any = {
      Bucket: bucket,
      Key: key,
      Expires:3600, // 1 hour from now
    };

    if (action === 'put' && mimeType) {
      (s3Params).ContentType = mimeType;
    }

    return this.s3.getSignedUrlPromise(action === 'put' ? 'putObject' : 'getObject', s3Params);
  }
}