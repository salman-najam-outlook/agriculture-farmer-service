import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  HasOne
} from 'sequelize-typescript';
import { Directive, Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { FLOAT, ENUM, INTEGER, STRING, DATE, DOUBLE, TINYINT } from 'sequelize';
import { Option } from './options.entity';
import { User } from 'src/users/entities/user.entity';
import { FarmCoordinates } from './farmCoordinates.entity';
import { Geofence } from 'src/geofence/entities/geofence.entity';
import { DueDiligenceProductionPlace } from 'src/due-diligence/production-place/entities/production-place.entity';
import { UserDDS } from 'src/users/entities/dds_user.entity';
import { DeforestationReportRequest } from 'src/deforestation/entities/deforestation_report_request.entity';
import { AssessmentSurvey } from 'src/assessment-builder/entities/assessment-survey.entity';


@Table({ tableName: 'user_farms' })
@Directive('@key(fields: "id")')
@ObjectType()
export class Farm extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID)
  id: number;

  @Column({ type: INTEGER })
  @Field(()=>Int, { nullable: true})
  cf_farmid: number;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  farmName: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  goal: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  registrationNo: string;

  @Column({ type: DOUBLE })
  @Field(() => Float, { nullable: true })
  lat: number;

  @Column({ type: DOUBLE })
  @Field(() => Float, { nullable: true })
  log: number;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  address: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  area: string;
  
  @Column({ type: FLOAT })
  @Field(() => Int, { nullable: true })
  areaUomId: number;

  @Column({ type: FLOAT })
  @Field(() => Int, { nullable: true })
  parameter: number;

  @Column({ type: FLOAT })
  @Field(() => Int, { nullable: true })
  parameterUomId: number;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  farmerRegId: number;

  @Column({ type: DataType.ENUM('personal', 'community') })
  @Field(() => String, { nullable: true })
  farmOwnershipType: string;
  
  @Column
  @Field(() => Int, { nullable: true })
  @ForeignKey(() => Option)
  farmType: number

  @BelongsTo(() => Option, {as: "farmTypeAssoc"})
  @Field(() => Option, { nullable: true })
  farmTypeAssoc: Option

  @Column
  @Field(() => String, { nullable: true })
  @ForeignKey(() => Option)
  productionSystem: string

  @BelongsTo(() => Option, {as: "productionSystemAssoc"})
  @Field(() => Option, { nullable: true })
  productionSystemAssoc: Option

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  farmOwner: string;

  @ForeignKey(() => User)
  @Column({ allowNull: true, type: DataType.INTEGER })
  @Field(() => Int, { nullable: true })
  userId: number;

  @BelongsTo(() => User, {as: "userAssoc"})
  @Field(() => User, { nullable:true})
  userAssoc: User;

  // dds user isolation;
  
  @ForeignKey(() => UserDDS)
  @Column({ allowNull: true, type: DataType.INTEGER })
  @Field(() => Int, { nullable: true })
  userDdsId: number;

  @BelongsTo(() => UserDDS, {as: "userDdsAssoc"})
  @Field(() => UserDDS, { nullable:true})
  userDdsAssoc: UserDDS;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  country: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  state: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  city: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  govRegistrationNum: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  contractMating: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  cooperativeId: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  cooperativeName: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  licenceNum: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  licenceExpiryDate: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  regulatorName: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  houseNum: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  street: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  farmNumber: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  communityName: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  regulatorRepresentiveName: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  isDeleted: string;

  @Column({ type: DataType.ENUM('crops', 'live stock', 'both') })
  @Field(() => String, { nullable: true })
  farmingActivity: string;


  @Field(() => [FarmCoordinates], { nullable: true })
  @HasMany(() => FarmCoordinates, {
    onDelete: 'CASCADE',
    hooks: true
  })
  FarmCoordinates: FarmCoordinates[];

  async hasCoordinates(): Promise<boolean> {
    const count = await FarmCoordinates.count({ where: { farmId: this.id } });
    return count > 0;
  }

  @Field(() => [Geofence], { nullable: true })
  @HasMany(() => Geofence, {
    onDelete: 'CASCADE',
    hooks: true
  })
  GeoFences: Geofence[];

  @Column({ type: INTEGER })
  @Field(() => Int, { nullable: true })
  clientId: number;

  @Column({ type: DATE})
  @Field(() => Date, {nullable: true })
  createdAt: Date;

  @UpdatedAt public updatedAt: Date;

  @Field(() => DueDiligenceProductionPlace, { nullable: true })
  @HasOne(() => DueDiligenceProductionPlace)
  productionPlace: DueDiligenceProductionPlace;

  @HasOne(() => DeforestationReportRequest, {
    foreignKey: 'farm_id',
    as: 'lastDeforestationReport',
    scope: {
      is_deleted: false,
      zoneId: null,
    },
  })
  @Field(() => DeforestationReportRequest, { nullable: true })
  lastDeforestationReport?: DeforestationReportRequest;

  @HasMany(() => AssessmentSurvey)
  assessmentSurveys: AssessmentSurvey[];
}
