import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { DueDiligenceProductionManuallyMitigated } from "src/due-diligence/production-place/entities/due-diligence-production-manually-mitigated.entity";
import { DueDiligenceProductionPlace } from "src/due-diligence/production-place/entities/production-place.entity";
import { Farm } from "src/farms/entities/farm.entity";

@ObjectType()
@Table({ tableName: "due_diligence_production_places_py_data" })
export class DueDiligenceProductionPlacesPyData extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => Int)
  id: number;

  @Column({ allowNull: true, field: "farmId" })
  @ForeignKey(() => Farm)
  @Field(() => String, { nullable: true })
  farmId: string;

  @BelongsTo(() => Farm)
  @Field(() => Farm, { nullable: true })
  farm: Farm;

  @Column({ allowNull: true, type: DataType.INTEGER })
  @ForeignKey(()=>DueDiligenceProductionPlace)
  @Field(() => Int, { nullable: true })
  productionPlaceId: number;

  @Column({ allowNull: true })
  @Field(() => String, { nullable: true })
  indigenousArea: string;
 
  @Column({ allowNull: true })
  @Field(() => String, { nullable: true })
  protectedArea: string;

  @Field(() => String, { nullable: true })
  indigenousAreaTrans: string;

  @Field(() => String, { nullable: true })
  protectedAreaTrans: string;

  @HasMany(() => DueDiligenceProductionManuallyMitigated)
  @Field(() => [DueDiligenceProductionManuallyMitigated], { nullable:true, defaultValue:[] })
  dueDiligenceProductionManuallyMitigated: DueDiligenceProductionManuallyMitigated[];

  @CreatedAt
  @Column({ allowNull: true })
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdatedAt
  @Column({ allowNull: true })
  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}
