import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
require("dotenv").config();

@Injectable()
export class S3 {
  constructor() {}
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ,
    secretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY ,
    region: process.env.AWS_REGION || 'us-west-1',
    signatureVersion: 'v4',
  });
}
