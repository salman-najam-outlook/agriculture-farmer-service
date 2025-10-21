import { registerEnumType } from "@nestjs/graphql";

export enum MultiStepAssessmentType {
    QUESTIONS= 'QUESTIONS',
    HEADINGS = 'HEADINGS'
}

registerEnumType(MultiStepAssessmentType, {
    name: 'MultiStepAssessmentType',
    description: 'Supported Assessment Multi step type.',
  });