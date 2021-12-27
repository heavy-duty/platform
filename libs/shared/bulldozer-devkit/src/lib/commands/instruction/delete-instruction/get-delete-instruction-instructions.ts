import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { getDeleteInstructionInstruction } from '.';
import {
  getDeleteInstructionAccountInstruction,
  getDeleteInstructionArgumentInstruction,
  getDeleteInstructionRelationInstruction,
} from '..';

export const getDeleteInstructionInstructions = (
  authority: PublicKey,
  program: Program,
  instructionPublicKey: PublicKey,
  instructionArgumentPublicKeys: PublicKey[],
  instructionAccountPublicKeys: PublicKey[],
  instructionRelationPublicKeys: PublicKey[]
): TransactionInstruction[] => [
  getDeleteInstructionInstruction(authority, program, instructionPublicKey),
  ...instructionArgumentPublicKeys.map((instructionArgumentPublicKey) =>
    getDeleteInstructionArgumentInstruction(
      authority,
      program,
      instructionArgumentPublicKey
    )
  ),
  ...instructionAccountPublicKeys.map((instructionAccountPublicKey) =>
    getDeleteInstructionAccountInstruction(
      authority,
      program,
      instructionAccountPublicKey
    )
  ),
  ...instructionRelationPublicKeys.map((instructionRelationPublicKey) =>
    getDeleteInstructionRelationInstruction(
      authority,
      program,
      instructionRelationPublicKey
    )
  ),
];
