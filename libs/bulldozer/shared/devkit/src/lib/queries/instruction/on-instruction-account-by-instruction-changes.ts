import { Connection, PublicKey } from '@solana/web3.js';
import { map } from 'rxjs/operators';
import {
  fromProgramAccountChange,
  getFiltersByInstruction,
} from '../../operations';
import { INSTRUCTION_ACCOUNT_ACCOUNT_NAME } from '../../utils';
import { createInstructionAccountDocument } from './utils';

export const onInstructionAccountByInstructionChanges = (
  connection: Connection,
  instructionPublicKey: PublicKey
) =>
  fromProgramAccountChange(connection, {
    commitment: connection.commitment,
    filters: getFiltersByInstruction(
      INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
      instructionPublicKey
    ),
  }).pipe(
    map(({ keyedAccountInfo }) =>
      createInstructionAccountDocument(
        keyedAccountInfo.accountId,
        keyedAccountInfo.accountInfo
      )
    )
  );
