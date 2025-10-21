import { ObjectType, Field, Directive, ID, Int } from "@nestjs/graphql";
import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { AssessmentQuestionOptions } from "src/assessment-builder/entities/assessment-question-options.entity";
import { AssessmentQuestions } from "src/assessment-builder/entities/assessment-questions.entity";
import { Assessment } from "src/assessment-builder/entities/assessment.entity";
import { DueDiligenceProductionPlace } from "src/due-diligence/production-place/entities/production-place.entity";
import { AssessmentMitigationChecklists } from "./assessment-mitigation_checklists.entity";
import { UserDDS as User } from "src/users/entities/dds_user.entity";
import { AssessmentMitigationDiscussions } from "./assessment-mitigation_discussions.entity";
import { Farm } from 'src/farms/entities/farm.entity';
import { AssessmentResponse } from 'src/assessment-builder/entities/assessment-response.entity';

@Table({ tableName: "assessment_question_mitigation" })
@ObjectType()
export class AssessmentMitigation extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    @Field(() => ID, { description: "id" })
    id: number;

    @Column({ allowNull: true })
    @Field(() => Int, { description: "due diligence id" })
    dueDiligenceId?: number;

    @ForeignKey(() => DueDiligenceProductionPlace)
    @Column({ allowNull: true })
    @Field(() => Int, { description: "production place id" })
    productionPlaceId?: number;

    @ForeignKey(() => Assessment)
    @Column({ allowNull: false })
    @Field(() => Int, { description: "assessment id" })
    assessmentId: number;

    @ForeignKey(() => AssessmentQuestions)
    @Column({ allowNull: true })
    @Field(() => Int, { nullable: true, description: "assessment question id" })
    assessmentQuestionId: number;
  
    @ForeignKey(() => AssessmentQuestionOptions)
    @Column({ allowNull: true })
    @Field(() => Int, { nullable: true, description: "assessment question option id" })
    assessmentQuestionOptionId: number;
  
    @Column({ allowNull: true })
    @Field(() => String, {nullable: true, description: "mitigation status" })
    mitigationStatus: string;

    @Column({ allowNull: true })
    @Field(() => Int, {nullable: true, description: "assigned user" })
    assignedUserId: string;

    @BelongsTo(() => User, {foreignKey:'assignedUserId', as :'assignedUser', targetKey: 'cf_userid'  })
    @Field(() => User, { nullable:true })
    assignedUser: User

    @Column({ defaultValue: false })
    @Field(() => Boolean, { nullable: true, defaultValue: false })
    isDeleted: boolean;

    @CreatedAt
    @Field(() => Date)
    public createdAt: Date;
  
    @UpdatedAt
    public updatedAt: Date;
  
    @BelongsTo(() => Assessment)
    @Field(() => Assessment)
    assessment: Assessment;
  
    @BelongsTo(() => DueDiligenceProductionPlace)
    @Field(() => DueDiligenceProductionPlace, { nullable: true})
    productionPlace?: DueDiligenceProductionPlace;
  
    @BelongsTo(() => AssessmentQuestions)
    @Field(() => AssessmentQuestions)
    assessmentQuestion: AssessmentQuestions;
    
    @BelongsTo(() => AssessmentQuestionOptions)
    @Field(() => AssessmentQuestionOptions)
    assessmentQuestionOption: AssessmentQuestionOptions;

    @HasMany(() => AssessmentMitigationDiscussions)
    @Field(() => [AssessmentMitigationDiscussions], { nullable: true })
    assessmentMitigationDiscussions: AssessmentMitigationDiscussions[];

    @Field(() => [AssessmentMitigationChecklists], { nullable: true })
    @HasMany(() => AssessmentMitigationChecklists, {
      onDelete: "CASCADE",
      hooks: true,
    })
    checkLists: AssessmentMitigationChecklists[];

    @ForeignKey(() => Farm)
    @Column({ references: { model: 'user_farms', key: 'id' } })
    @Field(() => Int)
    userFarmId: number;

    @BelongsTo(() => Farm, 'userFarmId')
    @Field(() => Farm, { nullable: true })
    userFarm: Farm;

    @ForeignKey(() => AssessmentResponse)
    @Column({ references: { model: 'assessment_responses', key: 'id' } })
    @Field(() => Int)
    assessmentResponseId: number;
  }
  