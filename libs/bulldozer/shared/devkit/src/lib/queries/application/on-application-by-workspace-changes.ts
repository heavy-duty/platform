import { Connection, PublicKey } from '@solana/web3.js';
import { map } from 'rxjs/operators';
import {
  fromProgramAccountChange,
  getFiltersByWorkspace,
} from '../../operations';
import { APPLICATION_ACCOUNT_NAME } from '../../utils';
import { createApplicationDocument } from './utils';

export const onApplicationByWorkspaceChanges = (
  connection: Connection,
  workspacePublicKey: PublicKey
) =>
  fromProgramAccountChange(connection, {
    commitment: connection.commitment,
    filters: getFiltersByWorkspace(
      APPLICATION_ACCOUNT_NAME,
      workspacePublicKey
    ),
  }).pipe(
    map(({ keyedAccountInfo }) =>
      createApplicationDocument(
        keyedAccountInfo.accountId,
        keyedAccountInfo.accountInfo
      )
    )
  );
