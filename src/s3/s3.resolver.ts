import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { S3Service } from './s3.service';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';

@Resolver()
export class S3Resolver {
  constructor(private readonly s3Service: S3Service) {}

  @Mutation(() => String)
  async getPreSignedUrl(
    @Args('objectName') objectName: string,
    @Args('mimeType') mimeType: string,
    @Args('isPrivate') isPrivate: boolean = false,
    @Args('moduleName') moduleName: string,
    @Args('action') action: 'get' | 'put',
    @GetTokenData("userid") userId: number,
  ): Promise<string> {
    return this.s3Service.getPreSignedUrl({ objectName, mimeType, isPrivate, action, moduleName, userId });
  }
}