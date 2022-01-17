import { AccountInfo, Connection, Context, PublicKey } from '@solana/web3.js';
import { fromEventPattern } from 'rxjs';

export const fromAccountChange = (
  connection: Connection,
  publicKey: PublicKey
) =>
  fromEventPattern<{ accountInfo: AccountInfo<Buffer>; context: Context }>(
    (addHandler) =>
      connection.onAccountChange(publicKey, (accountInfo, context) =>
        addHandler({ accountInfo, context })
      ),
    (removeHandler, id) =>
      connection.removeAccountChangeListener(id).then(removeHandler)
  );
