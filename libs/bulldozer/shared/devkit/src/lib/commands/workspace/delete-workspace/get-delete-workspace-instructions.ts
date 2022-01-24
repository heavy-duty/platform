import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { getDeleteWorkspaceInstruction } from '.';
import { getDeleteApplicationInstruction } from '../../application';
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

export const getDeleteWorkspaceInstructions = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  workspaceApplicationPublicKeys: PublicKey[],
  workspaceApplicationCollectionPublicKeys: PublicKey[],
  workspaceApplicationCollectionAttributePublicKeys: PublicKey[],
  workspaceApplicationInstructionPublicKeys: PublicKey[],
  workspaceApplicationInstructionArgumentPublicKeys: PublicKey[],
  workspaceApplicationInstructionAccountPublicKeys: PublicKey[],
  workspaceApplicationInstructionRelationPublicKeys: PublicKey[]
): TransactionInstruction[] => [
  getDeleteWorkspaceInstruction(authority, workspacePublicKey),
  ...workspaceApplicationPublicKeys.map((workspaceApplicationPublicKey) =>
    getDeleteApplicationInstruction(authority, workspaceApplicationPublicKey)
  ),
  ...workspaceApplicationCollectionPublicKeys.map(
    (workspaceApplicationCollectionPublicKey) =>
      getDeleteCollectionInstruction(
        authority,
        workspaceApplicationCollectionPublicKey
      )
  ),
  ...workspaceApplicationCollectionAttributePublicKeys.map(
    (workspaceApplicationCollectionAttributePublicKey) =>
      getDeleteCollectionAttributeInstruction(
        authority,
        workspaceApplicationCollectionAttributePublicKey
      )
  ),
  ...workspaceApplicationInstructionPublicKeys.map(
    (workspaceApplicationInstructionPublicKey) =>
      getDeleteInstructionInstruction(
        authority,
        workspaceApplicationInstructionPublicKey
      )
  ),
  ...workspaceApplicationInstructionArgumentPublicKeys.map(
    (workspaceApplicationInstructionArgumentPublicKey) =>
      getDeleteInstructionArgumentInstruction(
        authority,
        workspaceApplicationInstructionArgumentPublicKey
      )
  ),
  ...workspaceApplicationInstructionAccountPublicKeys.map(
    (workspaceApplicationInstructionAccountPublicKey) =>
      getDeleteInstructionAccountInstruction(
        authority,
        workspaceApplicationInstructionAccountPublicKey
      )
  ),
  ...workspaceApplicationInstructionRelationPublicKeys.map(
    (workspaceApplicationInstructionRelationPublicKey) =>
      getDeleteInstructionRelationInstruction(
        authority,
        workspaceApplicationInstructionRelationPublicKey
      )
  ),
];
