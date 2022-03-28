import {
  BorshAccountsCoder,
  BorshInstructionCoder,
  Program,
  Provider,
} from '@heavy-duty/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { Bulldozer, IDL } from './bulldozer';

export const BULLDOZER_PROGRAM_ID = new PublicKey(
  'YPyA65Xb6meVqaT9rW4L27CicSm7zNz7u7QLMb85Fdk'
);

let currentEndpoint: string;
let program: Program<Bulldozer>;

export const getBulldozerProgram = (endpoint: string) => {
  if (currentEndpoint && program && currentEndpoint === endpoint) {
    return program;
  }

  program = new Program<Bulldozer>(
    IDL,
    BULLDOZER_PROGRAM_ID,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new Provider(new Connection(endpoint), {} as any, Provider.defaultOptions())
  );

  return program;
};

export const accountsCoder = new BorshAccountsCoder(IDL);

export const instructionCoder = new BorshInstructionCoder(IDL);
