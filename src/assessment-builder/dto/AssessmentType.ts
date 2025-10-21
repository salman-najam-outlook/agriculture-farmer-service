import { registerEnumType } from "@nestjs/graphql";

export enum AssessmentType {
    DEFAULT_DIMITRA = "DEFAULT_DIMITRA",
    USER_CUSTOM = "USER_CUSTOM",
  }

  registerEnumType(AssessmentType, {
    name: 'AssessmentType',
    description: 'Supported Assessment Types.',
  });