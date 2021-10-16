import { Inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Program, Provider } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PROGRAM_CONFIGS } from './program.provider';
import { DummyWallet, ProgramConfig, ProgramConfigs, Wallet } from './utils';

interface ViewModel {
  connection: Connection | null;
  wallet: Wallet | null;
  programConfigs: Map<string, ProgramConfig> | null;
}

const initialState: ViewModel = {
  connection: null,
  wallet: null,
  programConfigs: null,
};

@Injectable()
export class ProgramStore extends ComponentStore<ViewModel> {
  readonly connection$ = this.select(({ connection }) => connection);
  readonly wallet$ = this.select(({ wallet }) => wallet);
  readonly programConfigs$ = this.select(
    ({ programConfigs }) => programConfigs
  );

  constructor(@Inject(PROGRAM_CONFIGS) programConfigs: ProgramConfigs) {
    super({
      ...initialState,
      programConfigs: Object.keys(programConfigs).reduce(
        (readers, programConfigId) =>
          readers.set(programConfigId, programConfigs[programConfigId]),
        new Map<string, ProgramConfig>()
      ),
    });
  }

  readonly loadConnection = this.effect(
    (connection$: Observable<Connection | null>) =>
      connection$.pipe(
        tap((connection) =>
          this.patchState({
            connection,
          })
        )
      )
  );

  readonly loadWallet = this.effect((wallet$: Observable<Wallet | undefined>) =>
    wallet$.pipe(
      tap((wallet) =>
        this.patchState({
          wallet: wallet || null,
        })
      )
    )
  );

  getReader(program: string): Observable<Program | null> {
    return this.select(
      this.connection$,
      this.select(
        this.programConfigs$,
        (programConfigs) => programConfigs && programConfigs.get(program)
      ),
      (connection, programConfig) =>
        connection && programConfig
          ? new Program(
              programConfig.idl,
              new PublicKey(programConfig.id),
              new Provider(
                connection,
                new DummyWallet(),
                Provider.defaultOptions()
              )
            )
          : null
    );
  }

  getWriter(program: string): Observable<Program | null> {
    return this.select(
      this.connection$,
      this.wallet$,
      this.select(
        this.programConfigs$,
        (programConfigs) => programConfigs?.get(program) || null
      ),
      (connection, wallet, programConfig) =>
        connection && programConfig && wallet
          ? new Program(
              programConfig.idl,
              new PublicKey(programConfig.id),
              new Provider(connection, wallet, {
                commitment: 'confirmed',
              })
            )
          : null
    );
  }
}
