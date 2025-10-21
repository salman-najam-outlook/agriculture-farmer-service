import { web3 } from '@project-serum/anchor';

export interface CreateTransactionData extends Record<string | number, unknown> {
  transactableId: string | number;
  transactableType: string;
}
export type CreateTransactionResult =
  | {
      success: true;
      attempts: number;
      txId: string;
      tx: web3.TransactionResponse | null;
    }
  | {
      success: false;
      attempts: number;
      txId?: string;
      error: web3.TransactionError;
    };

export interface DeforestationDataOnSolana extends Pick<CreateTransactionData, 'transactableId'> {
  farm: string;
  country?: string;
  deforestationStatus: string;
  protectedArea: string;
  indigenousArea: string;
  reportVersion: string;
  transactableType?: string;
}

export type CropYieldDataOnSolana = Pick<CreateTransactionData, 'transactableId'> & {
  farm: string;
  country: string;
  crop: string;
  transactableType?: string;
} & {
  [K in `yieldOnYear${number}`]: string;
};
