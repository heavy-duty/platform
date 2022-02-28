import { BorshInstructionCoder } from '@heavy-duty/anchor';
import { IDL } from './bulldozer';

const borshCoder = new BorshInstructionCoder(IDL);

export const parseBulldozerInstruction = (
  ix: Buffer | string,
  encoding: 'hex' | 'base58' = 'hex'
) => {
  return borshCoder.decode(ix, encoding);
};
