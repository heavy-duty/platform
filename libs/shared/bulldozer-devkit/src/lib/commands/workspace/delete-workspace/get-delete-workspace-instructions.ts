import { Program } from '@project-serum/anchor';
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
  program: Program,
  workspacePublicKey: PublicKey,
  workspaceApplicationPublicKeys: PublicKey[],
  workspaceApplicationCollectionPublicKeys: PublicKey[],
  workspaceApplicationCollectionAttributePublicKeys: PublicKey[],
  workspaceApplicationInstructionPublicKeys: PublicKey[],
  workspaceApplicationInstructionArgumentPublicKeys: PublicKey[],
  workspaceApplicationInstructionAccountPublicKeys: PublicKey[],
  workspaceApplicationInstructionRelationPublicKeys: PublicKey[]
): TransactionInstruction[] => [
  getDeleteWorkspaceInstruction(authority, program, workspacePublicKey),
  ...workspaceApplicationPublicKeys.map((workspaceApplicationPublicKey) =>
    getDeleteApplicationInstruction(
      authority,
      program,
      workspaceApplicationPublicKey
    )
  ),
  ...workspaceApplicationCollectionPublicKeys.map(
    (workspaceApplicationCollectionPublicKey) =>
      getDeleteCollectionInstruction(
        authority,
        program,
        workspaceApplicationCollectionPublicKey
      )
  ),
  ...workspaceApplicationCollectionAttributePublicKeys.map(
    (workspaceApplicationCollectionAttributePublicKey) =>
      getDeleteCollectionAttributeInstruction(
        authority,
        program,
        workspaceApplicationCollectionAttributePublicKey
      )
  ),
  ...workspaceApplicationInstructionPublicKeys.map(
    (workspaceApplicationInstructionPublicKey) =>
      getDeleteInstructionInstruction(
        authority,
        program,
        workspaceApplicationInstructionPublicKey
      )
  ),
  ...workspaceApplicationInstructionArgumentPublicKeys.map(
    (workspaceApplicationInstructionArgumentPublicKey) =>
      getDeleteInstructionArgumentInstruction(
        authority,
        program,
        workspaceApplicationInstructionArgumentPublicKey
      )
  ),
  ...workspaceApplicationInstructionAccountPublicKeys.map(
    (workspaceApplicationInstructionAccountPublicKey) =>
      getDeleteInstructionAccountInstruction(
        authority,
        program,
        workspaceApplicationInstructionAccountPublicKey
      )
  ),
  ...workspaceApplicationInstructionRelationPublicKeys.map(
    (workspaceApplicationInstructionRelationPublicKey) =>
      getDeleteInstructionRelationInstruction(
        authority,
        program,
        workspaceApplicationInstructionRelationPublicKey
      )
  ),
];
