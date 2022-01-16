import {
  Commitment,
  Connection,
  Context,
  GetProgramAccountsFilter,
  KeyedAccountInfo,
  PublicKey,
} from '@solana/web3.js';
import { fromEventPattern, Observable } from 'rxjs';

export const fromProgramAccountChange = (
  connection: Connection,
  programId: PublicKey,
  commitment?: Commitment,
  filters?: GetProgramAccountsFilter[]
): Observable<{ keyedAccountInfo: KeyedAccountInfo; context: Context }> =>
  fromEventPattern<{ keyedAccountInfo: KeyedAccountInfo; context: Context }>(
    (addHandler) =>
      connection.onProgramAccountChange(
        programId,
        (keyedAccountInfo, context) =>
          addHandler({ keyedAccountInfo, context }),
        commitment,
        filters
      ),
    (removeHandler, id) =>
      connection.removeProgramAccountChangeListener(id).then(removeHandler)
  );
