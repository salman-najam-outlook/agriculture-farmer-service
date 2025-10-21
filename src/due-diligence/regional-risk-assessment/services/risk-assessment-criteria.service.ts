import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { RiskAssessmentCriteria } from "../entities/risk-assessment-criteria.entity";

@Injectable()
export class RiskAssessmentCriteriaService {
    constructor(
        @InjectModel(RiskAssessmentCriteria)
        private readonly riskAssessmentCriteriaModel: typeof RiskAssessmentCriteria,
    ) { }
        
    async findAll(): Promise<RiskAssessmentCriteria[]> {
        return this.riskAssessmentCriteriaModel.findAll();
    }

}