import { Connection, PublicKey } from '@solana/web3.js';
import { map } from 'rxjs/operators';
import {
  fromProgramAccountChange,
  getFiltersByApplication,
} from '../../operations';
import { INSTRUCTION_ACCOUNT_NAME } from '../../utils';
import { createInstructionDocument } from './utils';

export const onInstructionByApplicationChanges = (
  connection: Connection,
  applicationPublicKey: PublicKey
) =>
  fromProgramAccountChange(connection, {
    commitment: connection.commitment,
    filters: getFiltersByApplication(
      INSTRUCTION_ACCOUNT_NAME,
      applicationPublicKey
    ),
  }).pipe(
    map(({ keyedAccountInfo }) =>
      createInstructionDocument(
        keyedAccountInfo.accountId,
        keyedAccountInfo.accountInfo
      )
    )
  );
