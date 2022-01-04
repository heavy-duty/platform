import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { getDeleteWorkspaceInstruction } from '.';
import {
  getDeleteCollectionAttributeInstruction,
  getDeleteInstructionAccountInstruction,
  getDeleteInstructionArgumentInstruction,
  getDeleteInstructionRelationInstruction,
} from '../..';
import { getDeleteApplicationInstruction } from '../../application';
import { getDeleteCollectionInstruction } from '../../collection';
import { getDeleteInstructionInstruction } from '../../instruction';

export const getDeleteWorkspaceInstructions = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKeys: PublicKey[],
  collectionPublicKeys: PublicKey[],
  collectionAttributePublicKeys: PublicKey[],
  instructionPublicKeys: PublicKey[],
  instructionArgumentPublicKeys: PublicKey[],
  instructionAccountPublicKeys: PublicKey[],
  instructionRelationPublicKeys: PublicKey[]
): TransactionInstruction[] => [
  getDeleteWorkspaceInstruction(authority, workspacePublicKey),
  ...applicationPublicKeys.map((applicationPublicKey) =>
    getDeleteApplicationInstruction(authority, applicationPublicKey)
  ),
  ...collectionPublicKeys.map((collectionPublicKey) =>
    getDeleteCollectionInstruction(authority, collectionPublicKey)
  ),
  ...collectionAttributePublicKeys.map((collectionAttributePublicKey) =>
    getDeleteCollectionAttributeInstruction(
      authority,
      collectionAttributePublicKey
    )
  ),
  ...instructionPublicKeys.map((instructionPublicKey) =>
    getDeleteInstructionInstruction(authority, instructionPublicKey)
  ),
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
