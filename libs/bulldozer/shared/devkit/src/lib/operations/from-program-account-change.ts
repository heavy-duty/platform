import {
  Connection,
  Context,
  GetProgramAccountsConfig,
  KeyedAccountInfo,
} from '@solana/web3.js';
import { fromEventPattern, Observable } from 'rxjs';
import { BULLDOZER_PROGRAM_ID } from '../programs';

export const fromProgramAccountChange = (
  connection: Connection,
  config: GetProgramAccountsConfig
): Observable<{ keyedAccountInfo: KeyedAccountInfo; context: Context }> =>
  fromEventPattern<{ keyedAccountInfo: KeyedAccountInfo; context: Context }>(
    (addHandler) =>
      connection.onProgramAccountChange(
        BULLDOZER_PROGRAM_ID,
        (keyedAccountInfo, context) =>
          addHandler({ keyedAccountInfo, context }),
        config.commitment,
        config.filters
      ),
    (removeHandler, id) =>
      connection.removeProgramAccountChangeListener(id).then(removeHandler)
  );
