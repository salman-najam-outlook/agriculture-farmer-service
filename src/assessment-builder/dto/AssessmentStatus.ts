import { registerEnumType } from "@nestjs/graphql";

export enum AssessmentStatus {
    ACTIVE = 'ACTIVE',
    IN_ACTIVE = 'IN_ACTIVE'
}

registerEnumType(AssessmentStatus, {
    name: 'AssessmentStatus',
    description: 'Supported Assessment Status.',
  });