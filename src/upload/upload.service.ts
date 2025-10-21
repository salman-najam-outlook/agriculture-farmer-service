import { Injectable } from "@nestjs/common";
import * as AWS from "aws-sdk";
import * as uuid from 'uuid';
import * as moment from 'moment';

@Injectable()
export class S3Service {
  constructor() {}
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    signatureVersion: "v4",
  });
  async uploadFile(file) {
    const { filename, mimetype } = await file.promise;
    const date = new Date();
    return await this.s3_upload(
      file,
      process.env.AWS_S3_BUCKET || "livestock-be-s3-dev",
      `${date.getTime()}-${filename}`,
      mimetype
    );
  }

  async s3_upload(file, bucket, name, mimetype, isBuffer = false) {
    console.log("bucket", bucket);
    console.log("mimetype", mimetype);
    let fileStream;
    // obtain the read stream function and the filename from the file.
    if (isBuffer) {
      fileStream = file;
    } else {
      let { createReadStream } = await file.promise;
      // read the data from the file.
      fileStream = createReadStream();
      // in case of an error, log it.
      fileStream.on("error", (error) => console.error(error));
    }

    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: fileStream,
      ContentType: mimetype,
    };

    try {
      let s3Response = await this.s3.upload(params).promise();
      return s3Response;
    } catch (e) {
      process.exit();
    }
  }

  async uploadReadableStream(stream, name) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || "livestock-be-s3-dev",
      Key: name,
      Body: stream,
    };
    return this.s3.upload(params).promise();
  }

  async uploadComplianceData(data: AWS.S3.Body, extension: string, name?: string) {
    if(!name) name = `${moment.now()}_${uuid.v4()}`;
    return this.s3.upload({
      Bucket: process.env.AWS_COMPLIANCE_BUCKET,
      Key: `${name}.${extension}`,
      Body: data,
      ObjectLockMode: 'COMPLIANCE',
      ObjectLockLegalHoldStatus: 'ON',
      ObjectLockRetainUntilDate: moment().add(7, 'years').toDate(),
    }).promise();
  }
}
