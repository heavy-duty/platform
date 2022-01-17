import { ReactiveConnection } from '@heavy-duty/rx-solana';
import { PublicKey } from '@solana/web3.js';
import {
  createInstructionRelationRelation,
  fromAccountChange,
} from '../../utils';

export const fromInstructionRelationChange = (
  connection: ReactiveConnection,
  publicKey: PublicKey
) =>
  fromAccountChange(connection, publicKey, createInstructionRelationRelation);
