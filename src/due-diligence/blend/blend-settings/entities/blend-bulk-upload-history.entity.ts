import { Table, Column, Model, CreatedAt, UpdatedAt, HasMany, DataType, DeletedAt, HasOne, ForeignKey } from 'sequelize-typescript';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Organization } from 'src/users/entities/organization.entity';
import { User } from 'src/users/entities/user.entity';

@Table({ tableName: 'blend_bulk_upload_history', paranoid: true })
@ObjectType()
export class BlendBulkUploadHistory extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  @Field(() => ID, { description: 'File History ID' })
  id: number;

  @Column({ allowNull: false })
  @Field(() => String, { description: 'File Location' })
  location: string;

  @Column({ allowNull: true, type: DataType.STRING })
  @Field(() => String, { description: 'Original File Name', nullable: true })
  originalFileName: string;

  @Column({ allowNull: true, type: DataType.STRING })
  @Field(() => String, { description: 's3 File Key', nullable: true })
  s3FileKey: string;

  @Column({ allowNull: true, type: DataType.STRING })
  @Field(() => String, { description: 'File Upload Status', nullable: true })
  status: string;
    
  @Column({ allowNull: true, type: DataType.STRING })
  @Field(() => String, { description: 'Total Records Count', nullable: true })
  totalRecordsCount: number;
    
  @Column({ allowNull: true, type: DataType.STRING })
  @Field(() => String, { description: 'Failed Records Count', nullable: true })
  failedRecordsCount: number;

  @ForeignKey(()=>Organization)
  @Column({ allowNull: false, type: DataType.INTEGER })
  @Field(() => Int, {description: "Organization ID", nullable: false })
  orgId: number;

  @ForeignKey(()=>User)
  @Column({ allowNull: false, type: DataType.INTEGER })
  @Field(() => Int, { description: "User ID" })
  createdBy: number;

  @CreatedAt
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdatedAt
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  @DeletedAt
  @Field(() => Date, { nullable: true })
  deletedAt: Date; 
}
