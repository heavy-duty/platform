import { Connection, PublicKey } from '@solana/web3.js';
import { map } from 'rxjs/operators';
import {
  fromProgramAccountChange,
  getFiltersByInstruction,
} from '../../operations';
import { INSTRUCTION_RELATION_ACCOUNT_NAME } from '../../utils';
import { createInstructionRelationDocument } from './utils';

export const onInstructionRelationByInstructionChanges = (
  connection: Connection,
  instructionPublicKey: PublicKey
) =>
  fromProgramAccountChange(connection, {
    commitment: connection.commitment,
    filters: getFiltersByInstruction(
      INSTRUCTION_RELATION_ACCOUNT_NAME,
      instructionPublicKey
    ),
  }).pipe(
    map(({ keyedAccountInfo }) =>
      createInstructionRelationDocument(
        keyedAccountInfo.accountId,
        keyedAccountInfo.accountInfo
      )
    )
  );
