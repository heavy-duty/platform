import { Connection } from '@solana/web3.js';
import { map } from 'rxjs/operators';
import { encodeFilters, fromProgramAccountChange } from '../../operations';
import {
  InstructionRelationFilters,
  INSTRUCTION_RELATION_ACCOUNT_NAME,
} from '../../utils';
import { createInstructionRelationDocument } from './utils';

export const onInstructionRelationsChanges = (
  connection: Connection,
  filters: InstructionRelationFilters
) =>
  fromProgramAccountChange(connection, {
    commitment: connection.commitment,
    filters: encodeFilters(INSTRUCTION_RELATION_ACCOUNT_NAME, filters),
  }).pipe(
    map(({ keyedAccountInfo }) =>
      createInstructionRelationDocument(
        keyedAccountInfo.accountId,
        keyedAccountInfo.accountInfo
      )
    )
  );
