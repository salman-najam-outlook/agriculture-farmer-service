import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'global_translation_metadata' })
@ObjectType()
export class Translation extends Model {
  @PrimaryKey
  @Column({ autoIncrement: true })
  @Field(() => ID, { description: 'translation id' })
  id: number;

  @Column
  @Field({ description: 'english translation', nullable: true })
  english: string;

  @Column
  @Field({ description: 'hindi translation', nullable: true })
  hindi: string;

  @Column
  @Field({ description: 'japanese translation', nullable: true })
  japanese: string;

  @Column
  @Field({ description: 'marathi translation', nullable: true })
  marathi: string;

  @Column
  @Field({ description: 'nepali translation', nullable: true })
  nepali: string;

  @Column
  @Field({ description: 'spanish translation', nullable: true })
  spanish: string;

  @Column
  @Field({ description: 'swahili translation', nullable: true })
  swahili: string;

  @Column
  @Field({ description: 'indonesian translation', nullable: true }) // Renamed from 'indian' to 'indonesian'
  indonesian: string;

  @Column
  @Field({ description: 'french translation', nullable: true })
  french: string;

  @Column
  @Field({ description: 'portugese translation', nullable: true })
  portugese: string;

  @Column
  @Field({ description: 'arabic translation', nullable: true })
  arabic: string;

  @Column
  @Field({ description: 'bengali translation', nullable: true })
  bengali: string;

  @Column
  @Field({ description: 'oromo translation', nullable: true })
  oromo: string;

  @Column
  @Field({ description: 'somali translation', nullable: true })
  somali: string;

  @Column
  @Field({ description: 'vietnamese translation', nullable: true })
  vietnamese: string;

  @Column
  @Field({ description: 'amharic translation', nullable: true })
  amharic: string;

  @Column
  @Field({ description: 'greek translation', nullable: true })
  greek: string;

  @Column
  @Field({ description: 'mandarin translation', nullable: true })
  mandarin: string;

  @Column
  @Field({ description: 'turkish translation', nullable: true })
  turkish: string;

  @Column
  @Field({ description: 'dutch translation', nullable: true })
  dutch: string;

  @Column
  @Field({ description: 'italian translation', nullable: true })
  italian: string;

  @CreatedAt
  @Field(() => Date, { description: 'creation date', nullable: true })
  createdAt: Date;

  @UpdatedAt
  @Field(() => Date, { description: 'last update date', nullable: true })
  updatedAt: Date;
}