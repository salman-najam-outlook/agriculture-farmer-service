var aws = require('aws-sdk');
const { S3Client } = require('@aws-sdk/client-s3');
const REGION = 'us-west-1'; // need us west for dev becayse us west in python

// Create an Amazon S3 service client object.
export const s3Client = new S3Client({ region: REGION });
// AWS sdk s3 object
aws.config = new aws.Config({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-west-1',// need us west for dev becayse us west in python
  signatureVersion: 'v4',
});

export const s3West = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
}) 

export const sqs = new aws.SQS({});
export const s3 = new aws.S3({});

