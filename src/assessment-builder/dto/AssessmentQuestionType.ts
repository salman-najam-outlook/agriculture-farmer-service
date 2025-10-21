import { registerEnumType } from "@nestjs/graphql";

export enum AssessmentQuestionType {
    RADIO_BUTTON = "RADIO_BUTTON",
    DROPDOWN_OPTIONS = "DROPDOWN_OPTIONS",
    TEXT_FIELD = "TEXT_FIELD",
    TEXT_FIELD_NUMERIC = "TEXT_FIELD_NUMERIC",
    TEXT_AREA = "TEXT_AREA",
    DATE_FIELD="DATE_FIELD",
    CHECK_BOXES = "CHECK_BOXES",
    FILE_ATTACHMENT = "FILE_ATTACHMENT",
    DIGITAL_SIGNATURE = "DIGITAL_SIGNATURE",
    GPS_LOCATION = "GPS_LOCATION",
    // HEADING = "HEADING",
  }

  registerEnumType(AssessmentQuestionType, {
    name: 'AssessmentQuestionType',
    description: 'Supported Assessment Question Types.',
  });