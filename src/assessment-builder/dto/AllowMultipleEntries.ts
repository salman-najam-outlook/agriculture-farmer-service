import { registerEnumType } from "@nestjs/graphql";

export enum AllowMultipleEntries {
    AFTER_EXPIRY ='AFTER_EXPIRY',
    ANY_TIME= 'ANY_TIME'
}

registerEnumType(AllowMultipleEntries, {
    name: 'AllowMultipleEntries',
    description: 'Supported Assessment Setting allow multiple entires of assessment.',
  });