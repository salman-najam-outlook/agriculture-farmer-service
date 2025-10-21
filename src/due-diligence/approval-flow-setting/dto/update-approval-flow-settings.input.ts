import { InputType, PartialType } from '@nestjs/graphql';
import { CreateApprovalFlowSettingInput } from './create-approval-flow-settings.input';

@InputType()
export class UpdateApprovalFlowSettingInput extends PartialType(CreateApprovalFlowSettingInput) {}
