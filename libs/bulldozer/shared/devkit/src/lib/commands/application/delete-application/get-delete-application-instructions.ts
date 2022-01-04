import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { getDeleteApplicationInstruction } from '.';
import {
  getDeleteCollectionAttributeInstruction,
  getDeleteInstructionAccountInstruction,
  getDeleteInstructionArgumentInstruction,
  getDeleteInstructionRelationInstruction,
} from '../..';
import { getDeleteCollectionInstruction } from '../../collection';
import { getDeleteInstructionInstruction } from '../../instruction';

export const getDeleteApplicationInstructions = (
  authority: PublicKey,
  applicationPublicKey: PublicKey,
  applicationCollectionPublicKeys: PublicKey[],
  applicationCollectionAttributePublicKeys: PublicKey[],
  applicationInstructionPublicKeys: PublicKey[],
  applicationInstructionArgumentPublicKeys: PublicKey[],
  applicationInstructionAccountPublicKeys: PublicKey[],
  applicationInstructionRelationPublicKeys: PublicKey[]
): TransactionInstruction[] => [
  getDeleteApplicationInstruction(authority, applicationPublicKey),
  ...applicationCollectionPublicKeys.map((applicationCollectionPublicKey) =>
    getDeleteCollectionInstruction(authority, applicationCollectionPublicKey)
  ),
  ...applicationCollectionAttributePublicKeys.map(
    (applicationCollectionAttributePublicKey) =>
      getDeleteCollectionAttributeInstruction(
        authority,
        applicationCollectionAttributePublicKey
      )
  ),
  ...applicationInstructionPublicKeys.map((applicationInstructionPublicKey) =>
    getDeleteInstructionInstruction(authority, applicationInstructionPublicKey)
  ),
  ...applicationInstructionArgumentPublicKeys.map(
    (applicationInstructionArgumentPublicKey) =>
      getDeleteInstructionArgumentInstruction(
        authority,
        applicationInstructionArgumentPublicKey
      )
  ),
  ...applicationInstructionAccountPublicKeys.map(
    (applicationInstructionAccountPublicKey) =>
      getDeleteInstructionAccountInstruction(
        authority,
        applicationInstructionAccountPublicKey
      )
  ),
  ...applicationInstructionRelationPublicKeys.map(
    (applicationInstructionRelationPublicKey) =>
      getDeleteInstructionRelationInstruction(
        authority,
        applicationInstructionRelationPublicKey
      )
  ),
];
