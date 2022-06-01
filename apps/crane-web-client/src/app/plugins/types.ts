import { TransactionInstruction } from '@solana/web3.js';

export type IdlInstructionArgument =
  | {
      name: string;
      type: string;
    }
  | {
      name: string;
      type: {
        defined: string;
      };
    }
  | {
      name: string;
      type: {
        option: string;
      };
    }
  | {
      name: string;
      type: {
        coption: string;
      };
    };

export interface IdlInstruction {
  name: string;
  accounts: {
    name: string;
    isMut: boolean;
    isSigner: boolean;
  }[];
  args: IdlInstructionArgument[];
}

export interface PluginInterface {
  namespace: string;
  name: string;
  instructions: IdlInstruction[];
  getInstruction(instructionName: string): IdlInstruction | null;
  getTransactionInstruction(
    instructionName: string,
    args: { [argName: string]: string },
    accounts: { [accountName: string]: string }
  ): TransactionInstruction | null;
}

export interface PluginsServiceInterface {
  plugins: PluginInterface[];
  registerAll(plugins: PluginInterface[]): void;
  getPlugin(namespace: string, program: string): PluginInterface | null;
}
