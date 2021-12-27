import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { getDeleteApplicationInstruction } from '.';
import {
  getDeleteCollectionAttributeInstruction,
  getDeleteCollectionInstruction,
} from '../../collection';
import {
  getDeleteInstructionAccountInstruction,
  getDeleteInstructionArgumentInstruction,
  getDeleteInstructionInstruction,
  getDeleteInstructionRelationInstruction,
} from '../../instruction';

export const getDeleteApplicationInstructions = (
  authority: PublicKey,
  program: Program,
  applicationPublicKey: PublicKey,
  applicationCollectionPublicKeys: PublicKey[],
  applicationCollectionAttributePublicKeys: PublicKey[],
  applicationInstructionPublicKeys: PublicKey[],
  applicationInstructionArgumentPublicKeys: PublicKey[],
  applicationInstructionAccountPublicKeys: PublicKey[],
  applicationInstructionRelationPublicKeys: PublicKey[]
): TransactionInstruction[] => [
  getDeleteApplicationInstruction(authority, program, applicationPublicKey),
  ...applicationCollectionPublicKeys.map((applicationCollectionPublicKey) =>
    getDeleteCollectionInstruction(
      authority,
      program,
      applicationCollectionPublicKey
    )
  ),
  ...applicationCollectionAttributePublicKeys.map(
    (applicationCollectionAttributePublicKey) =>
      getDeleteCollectionAttributeInstruction(
        authority,
        program,
        applicationCollectionAttributePublicKey
      )
  ),
  ...applicationInstructionPublicKeys.map((applicationInstructionPublicKey) =>
    getDeleteInstructionInstruction(
      authority,
      program,
      applicationInstructionPublicKey
    )
  ),
  ...applicationInstructionArgumentPublicKeys.map(
    (applicationInstructionArgumentPublicKey) =>
      getDeleteInstructionArgumentInstruction(
        authority,
        program,
        applicationInstructionArgumentPublicKey
      )
  ),
  ...applicationInstructionAccountPublicKeys.map(
    (applicationInstructionAccountPublicKey) =>
      getDeleteInstructionAccountInstruction(
        authority,
        program,
        applicationInstructionAccountPublicKey
      )
  ),
  ...applicationInstructionRelationPublicKeys.map(
    (applicationInstructionRelationPublicKey) =>
      getDeleteInstructionRelationInstruction(
        authority,
        program,
        applicationInstructionRelationPublicKey
      )
  ),
];
