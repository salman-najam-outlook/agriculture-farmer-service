export type DimitraDeforestationProtocolLogMemo = {
  address: string;
  metadata: {
    name: string;
    version: string;
    spec: string;
    description: string;
  };
  instructions: Array<{
    name: string;
    docs: string[];
    discriminator: number[];
    accounts: Array<{
      name: string;
      docs: string[];
      writable?: boolean;
      signer?: boolean;
      address?: string;
    }>;
    args: Array<{ name: string; type: string }>;
  }>;
  errors: Array<{
    code: number;
    name: string;
    msg: string;
  }>;
};
