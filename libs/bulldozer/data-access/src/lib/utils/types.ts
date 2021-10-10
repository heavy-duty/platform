import { PublicKey, Transaction } from '@solana/web3.js';

export interface Wallet {
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  publicKey: PublicKey;
}

export interface ApplicationInfo {
  authority: string;
  name: string;
}

export interface Application {
  id: string;
  data: ApplicationInfo;
}

export interface CollectionInfo {
  authority: string;
  application: string;
  name: string;
}

export interface Collection {
  id: string;
  data: CollectionInfo;
}

export interface CollectionAttributeInfo {
  authority: string;
  application: string;
  collection: string;
  name: string;
  kind: {
    id: number;
    name: string;
    size: number;
  };
  modifier: {
    id: number;
    name: string;
    size: number;
  };
}

export interface CollectionAttribute {
  id: string;
  data: CollectionAttributeInfo;
}

export interface InstructionInfo {
  authority: string;
  application: string;
  name: string;
}

export interface Instruction {
  id: string;
  data: InstructionInfo;
}

export interface InstructionArgumentInfo {
  authority: string;
  application: string;
  instruction: string;
  name: string;
  kind: {
    id: number;
    name: string;
    size: number;
  };
  modifier: {
    id: number;
    name: string;
    size: number;
  };
}

export interface InstructionArgument {
  id: string;
  data: InstructionArgumentInfo;
}

export interface InstructionBasicAccountInfo {
  authority: string;
  application: string;
  instruction: string;
  name: string;
  collection: string;
  markAttribute: {
    id: number;
    name: string;
  };
}

export interface InstructionBasicAccount {
  id: string;
  data: InstructionBasicAccountInfo;
}

export interface InstructionSignerAccountInfo {
  authority: string;
  application: string;
  instruction: string;
  name: string;
  markAttribute: {
    id: number;
    name: string;
  };
}

export interface InstructionSignerAccount {
  id: string;
  data: InstructionSignerAccountInfo;
}

export interface InstructionProgramAccountInfo {
  authority: string;
  application: string;
  instruction: string;
  name: string;
  program: string;
}

export interface InstructionProgramAccount {
  id: string;
  data: InstructionProgramAccountInfo;
}

export interface Program {
  id: string;
  name: string;
}

export interface InstructionAccountInfo {
  authority: string;
  application: string;
  instruction: string;
  name: string;
  kind: {
    id: number;
    name: string;
  };
  modifier: {
    id: number;
    name: string;
  };
  collection: string | null;
  program: string | null;
  space: number | null;
  payer: string | null;
  close: string | null;
}

export interface InstructionAccount {
  id: string;
  data: InstructionAccountInfo;
}
