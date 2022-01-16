import { Injectable } from '@angular/core';
import { ReactiveConnection } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore } from '@ngrx/component-store';
import { ConnectionConfig } from '@solana/web3.js';
import { combineLatest, tap } from 'rxjs';

const CONNECTION_DEFAULT_URL = 'http://localhost:8899';
const CONNECTION_DEFAULT_CONFIG: ConnectionConfig = {
  commitment: 'confirmed',
};

interface ConnectionState {
  connection: ReactiveConnection | null;
  endpoint: string | null;
  config: ConnectionConfig;
}

@Injectable()
export class ConnectionStore extends ComponentStore<ConnectionState> {
  readonly connection$ = this.select(({ connection }) => connection);
  readonly endpoint$ = this.select(({ endpoint }) => endpoint);
  readonly config$ = this.select(({ config }) => config);

  constructor() {
    super({
      connection: new ReactiveConnection(
        CONNECTION_DEFAULT_URL,
        CONNECTION_DEFAULT_CONFIG
      ),
      endpoint: CONNECTION_DEFAULT_URL,
      config: CONNECTION_DEFAULT_CONFIG,
    });
  }

  readonly setEndpoint = this.updater((state, endpoint: string) => ({
    ...state,
    endpoint,
  }));

  readonly setConfig = this.updater((state, config: ConnectionConfig) => ({
    ...state,
    config,
  }));

  readonly setConnection = this.updater(
    (state, connection: ReactiveConnection | null) => ({
      ...state,
      connection,
    })
  );

  readonly loadConnection = this.effect(() =>
    combineLatest([this.endpoint$, this.config$]).pipe(
      tap(([endpoint, config]) =>
        this.setConnection(
          endpoint ? new ReactiveConnection(endpoint, config) : null
        )
      )
    )
  );
}
