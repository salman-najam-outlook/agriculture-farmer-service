import { Controller, Post,Get, Body, Query } from '@nestjs/common';
import { S3Service } from './s3.service';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';

@Controller('api/s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Get('/presigned-url')
  async getPreSignedUrls(): Promise<string> {
    return 'Hello World presigned url!';
    }

  @Post('/presigned-url')
  async getPreSignedUrl(
    @Body('objectName') objectName: string,
    @Body('mimeType') mimeType: string,
    @Body('isPrivate') isPrivate: boolean = false,
    @Body('moduleName') moduleName: string,
    @Body('action') action: 'get' | 'put',
    @GetTokenData("userid") userId: number,
  ): Promise<
    {
      code: number;
      message: string;
      data:  string;
    }
  > {
    try {
      const url = await  this.s3Service.getPreSignedUrl({ objectName, mimeType, isPrivate, action, moduleName, userId });
      return { code: 200, message: 'Success', data:  url  };
    } catch (error) {
      return { code: 500, message: 'Internal Server Error', data:  error.message  };
    }
  }
}