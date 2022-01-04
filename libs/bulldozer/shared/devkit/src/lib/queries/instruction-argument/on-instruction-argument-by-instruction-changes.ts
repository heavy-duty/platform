import { Connection, PublicKey } from '@solana/web3.js';
import { map } from 'rxjs/operators';
import {
  fromProgramAccountChange,
  getFiltersByInstruction,
} from '../../operations';
import { INSTRUCTION_ARGUMENT_ACCOUNT_NAME } from '../../utils';
import { createInstructionArgumentDocument } from './utils';

export const onInstructionArgumentByInstructionChanges = (
  connection: Connection,
  instructionPublicKey: PublicKey
) =>
  fromProgramAccountChange(connection, {
    commitment: connection.commitment,
    filters: getFiltersByInstruction(
      INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
      instructionPublicKey
    ),
  }).pipe(
    map(({ keyedAccountInfo }) =>
      createInstructionArgumentDocument(
        keyedAccountInfo.accountId,
        keyedAccountInfo.accountInfo
      )
    )
  );
