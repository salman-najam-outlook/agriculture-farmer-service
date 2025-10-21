import { ModelCtor } from "sequelize-typescript";
import { Assessment } from "../entities/assessment.entity";
import { AssessmentSetting } from "../entities/assessment-setting.entity";
import { AssessmentSelectedUser } from "../entities/assessment-users.entity";
import { AssessmentQuestions } from "../entities/assessment-questions.entity";
import { AssessmentQuestionOptions } from "../entities/assessment-question-options.entity";
import { AssessmentOptionsAndSubQuestionsMapping } from "../entities/assessments-options-and-sub-questions-mapping.entity";
import { AssessmentQuestionHeading } from "../entities/assessment-question-headings.entity";
import {AssessmentUploads} from "../entities/assessment-uploads.entity";
import { AssessmentResponse } from "../entities/assessment-response.entity";
import { AssessmentSurvey } from "../entities/assessment-survey.entity";
import { AssessmentProductionPlace } from "../entities/assessment-production-place.entity";

export const ASSESSMENT_MODELS: ModelCtor[] = [
  Assessment,
  AssessmentSetting,
  AssessmentSelectedUser,
  AssessmentQuestions,
  AssessmentQuestionOptions,
  AssessmentOptionsAndSubQuestionsMapping,
  AssessmentQuestionHeading,
  AssessmentUploads,
  AssessmentSurvey,
  AssessmentResponse,
  AssessmentProductionPlace,
];
