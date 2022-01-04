import { Connection, PublicKey } from '@solana/web3.js';
import { map } from 'rxjs/operators';
import {
  fromProgramAccountChange,
  getFiltersByAuthority,
} from '../../operations';
import { WORKSPACE_ACCOUNT_NAME } from '../../utils';
import { createWorkspaceDocument } from './utils';

export const onWorkspaceByAuthorityChanges = (
  connection: Connection,
  authority: PublicKey
) =>
  fromProgramAccountChange(connection, {
    commitment: connection.commitment,
    filters: getFiltersByAuthority(WORKSPACE_ACCOUNT_NAME, authority),
  }).pipe(
    map(({ keyedAccountInfo }) =>
      createWorkspaceDocument(
        keyedAccountInfo.accountId,
        keyedAccountInfo.accountInfo
      )
    )
  );
