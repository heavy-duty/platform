import { Connection } from '@solana/web3.js';
import { map } from 'rxjs/operators';
import { encodeFilters, fromProgramAccountChange } from '../../operations';
import { WorkspaceFilters, WORKSPACE_ACCOUNT_NAME } from '../../utils';
import { createWorkspaceDocument } from './utils';

export const onWorkspacesChanges = (
  connection: Connection,
  filters: WorkspaceFilters
) =>
  fromProgramAccountChange(connection, {
    commitment: connection.commitment,
    filters: encodeFilters(WORKSPACE_ACCOUNT_NAME, filters),
  }).pipe(
    map(({ keyedAccountInfo }) =>
      createWorkspaceDocument(
        keyedAccountInfo.accountId,
        keyedAccountInfo.accountInfo
      )
    )
  );
