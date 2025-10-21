import { InputType, Int, Field, Float } from '@nestjs/graphql';

@InputType()
 class CoordsInput {
  @Field(() => Int, {nullable: true })
  farmId: number;

  @Field(() => Int, {nullable: true })
  userId: number;
  
  @Field(() => Float, {nullable: true })
  lat: number;
  
  @Field(() => Float, {nullable: true })
  log: number;
}

@InputType()
export class CreateFarmCoordsInput {
   
  @Field(() => [CoordsInput], {nullable: true })
  farmCoords: [CoordsInput];

}
