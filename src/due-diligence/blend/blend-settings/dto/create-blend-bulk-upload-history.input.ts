import { InputType, Field, Int, ObjectType } from '@nestjs/graphql';

@InputType()
export class CreateBulkUploadHistoryInput {
  @Field(() => String, { description: 'File Location' })
  location: string;

  @Field(() => String, { description: 'Original File Name', nullable: true })
  originalFileName?: string;

  @Field(() => String, { description: 's3 File Key', nullable: true })
  s3FileKey?: string;

  @Field(() => String, { description: 'File Upload Status', nullable: true })
  status?: string;

  @Field(() => Int, { description: 'Total Records Count', nullable: true })
  totalRecordsCount?: number;

  @Field(() => Int, { description: 'Failed Records Count', nullable: true })
  failedRecordsCount?: number;

  @Field(() => Int, { description: 'Organization ID' })
  orgId: number;

  @Field(() => Int, { description: 'Created By User ID' })
  createdBy: number;
}