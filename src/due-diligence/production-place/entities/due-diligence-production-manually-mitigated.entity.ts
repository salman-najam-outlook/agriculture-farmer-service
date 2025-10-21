import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { DueDiligenceProductionPlacesPyData } from "src/deforestation/entities/due_diligence_production_places_py_data.entity";

@ObjectType()
@Table({ tableName: "due_diligence_production_manually_mitigated" })
export class DueDiligenceProductionManuallyMitigated extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => Int)
  id: number;

  @Column({ allowNull: true, field: "dueDiligenceProductionPlacesPyDataId" })
  @ForeignKey(() => DueDiligenceProductionPlacesPyData)
  @Field(() => String, { nullable: true })
  dueDiligenceProductionPlacesPyDataId: string;

  @BelongsTo(() => DueDiligenceProductionPlacesPyData)
  @Field(() => DueDiligenceProductionPlacesPyData, { nullable: true })
  dueDiligenceProductionPlacesPyData: DueDiligenceProductionPlacesPyData;

  @Column({ allowNull: true })
  @Field(() => String, { nullable: true })
  riskMitigationFile: string;
 
  @Column({ allowNull: true })
  @Field(() => String, { nullable: true })
  riskMitigationComment: string;

  @CreatedAt
  @Column({ allowNull: true })
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdatedAt
  @Column({ allowNull: true })
  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}
