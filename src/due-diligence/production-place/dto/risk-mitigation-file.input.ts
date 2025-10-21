import {InputType, Field, Int} from '@nestjs/graphql';
@InputType()
export class RiskMitigationFileInput {
    @Field(() => Int)
    production_place_id: number;

    @Field(() => String)
    files: string;
}

@InputType()
export class UpdateRiskMitigationInput {
    @Field(() => Int,{nullable:false})
    id: number;

    @Field(() => String, { nullable: false })
    eudr_deforestation_status?: 'Very High Probability' | 'High Probability' | 'Low Probability' | 'Zero/Negligible Probability' | 'Manually Mitigated';

    @Field(() => String, { nullable: true })
    risk_mitigation_comment?: string;

    @Field(() => [String], { nullable: false })
    files?: string[];
}

@InputType()
export class UpdateManuallyMitigationInput {
    @Field(() => Int, {nullable:false})
    id: number;

    @Field(() => String, { nullable: true })
    riskMitigationComment?: string;

    @Field(() => String, { nullable: false })
    riskMitigationFile?: string;
}

@InputType()
export class MitigateProductionPlaceInput {
    @Field(() => Int, { nullable: false })
    dueDiligenceReportId: number;
  
    @Field(() => String, { nullable: true })
    riskAssessmentStatus: 'mitigation_required' | 'rejected';
  
    @Field(() => String, { nullable: true })
    mitigationComment?: string;
  
    @Field(() => String, { nullable: false, description:'File' })
    file?: string;

    @Field(() => Int, { nullable: false })
    assessmentId: number;
}

@InputType()
export  class HighRiskFarmMitigationInput{
    @Field(() => Int,{nullable:false})
    due_diligence_report_id: number;

    @Field(() => String, { nullable: false })
    eudr_deforestation_status?: 'Very High Probability' | 'High Probability' | 'Low Probability' | 'Zero/Negligible Probability' | 'Manually Mitigated';


    @Field(() => String, { nullable: true })
    risk_mitigation_comment?: string;

    @Field(() => String, { nullable: false, description:'File' })
    file?: string;
}


