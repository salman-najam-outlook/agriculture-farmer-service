import { ModelCtor } from "sequelize-typescript";
import { AssessmentMitigation } from "../entities/assessment-mitigation.entity";
import { AssessmentMitigationDiscussions } from "../entities/assessment-mitigation_discussions.entity";
import { AssessmentMitigationChecklists } from "../entities/assessment-mitigation_checklists.entity";
import { AssessmentMitigationAttachments } from "../entities/assessment-mitigation_attachments.entity";

export const ASSESSMENT_MITIGATION_MODELS: ModelCtor[] = [
  AssessmentMitigation,
  AssessmentMitigationDiscussions,
  AssessmentMitigationChecklists,
  AssessmentMitigationAttachments,
];
