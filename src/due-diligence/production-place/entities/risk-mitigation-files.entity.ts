import { ObjectType, Field, Directive, ID, Int } from "@nestjs/graphql";
import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { DueDiligenceProductionPlace } from "./production-place.entity";

@Table({ tableName: "risk_mitigation_files" })
@ObjectType()
export class RiskMitigationFiles extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  @Field(() => ID, { description: "id" })
  id: number;

  @ForeignKey(() => DueDiligenceProductionPlace)
  @Column({ allowNull: false })
  @Field(() => Int, { description: "production place id" })
  production_place_id: number;

  @Column({ allowNull: false })
  @Field(() => String, { description: "file path" })
  file_path: string;

  @CreatedAt
  public createdAt: Date;

  @UpdatedAt
  public updatedAt: Date;

  @BelongsTo(() => DueDiligenceProductionPlace)
  @Field(() => DueDiligenceProductionPlace)
  production_place: DueDiligenceProductionPlace;
}
