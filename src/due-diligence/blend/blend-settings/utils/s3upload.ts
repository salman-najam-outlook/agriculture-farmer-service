import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION_PUBLIC_BUCKET,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    filename?: string,
    bucket: string = process.env.AWS_PUBLIC_BUCKET,
  ): Promise<string> {
    try {
      console.log(bucket);
      if (!file) {
        throw new BadRequestException('File must be provided');
      }

      const extension = file.originalname.split('.').pop();
      const Key = `${filename ?? Date.now().toString()}.${extension}`;

      const params = {
        Bucket: bucket,
        Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read' as ObjectCannedACL,
      };

      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);

      return `https://${bucket}.s3.${process.env.AWS_REGION_PUBLIC_BUCKET}.amazonaws.com/${Key}`;
    } catch (err) {
      console.error('Error uploading file to S3:', err);
      throw new BadRequestException('Upload to S3 failed');
    }
  }
}
