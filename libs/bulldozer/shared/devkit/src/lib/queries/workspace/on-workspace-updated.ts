import { Connection, PublicKey } from '@solana/web3.js';
import { map } from 'rxjs/operators';
import { fromAccountChange } from '../../operations';
import { createWorkspaceDocument } from './utils';

export const onWorkspaceUpdated = (
  connection: Connection,
  publicKey: PublicKey
) =>
  fromAccountChange(connection, publicKey).pipe(
    map(({ accountInfo }) =>
      accountInfo.lamports === 0
        ? null
        : createWorkspaceDocument(publicKey, accountInfo)
    )
  );
