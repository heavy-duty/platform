import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { getDeleteInstructionInstruction } from '.';
import {
  getDeleteInstructionAccountInstruction,
  getDeleteInstructionArgumentInstruction,
  getDeleteInstructionRelationInstruction,
} from '..';

export const getDeleteInstructionInstructions = (
  authority: PublicKey,
  instructionPublicKey: PublicKey,
  instructionArgumentPublicKeys: PublicKey[],
  instructionAccountPublicKeys: PublicKey[],
  instructionRelationPublicKeys: PublicKey[]
): TransactionInstruction[] => [
  getDeleteInstructionInstruction(authority, instructionPublicKey),
  ...instructionArgumentPublicKeys.map((instructionArgumentPublicKey) =>
    getDeleteInstructionArgumentInstruction(
      authority,
      instructionArgumentPublicKey
    )
  ),
  ...instructionAccountPublicKeys.map((instructionAccountPublicKey) =>
    getDeleteInstructionAccountInstruction(
      authority,
      instructionAccountPublicKey
    )
  ),
  ...instructionRelationPublicKeys.map((instructionRelationPublicKey) =>
    getDeleteInstructionRelationInstruction(
      authority,
      instructionRelationPublicKey
    )
  ),
];
