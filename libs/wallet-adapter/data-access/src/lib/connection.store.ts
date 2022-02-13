import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { Connection, ConnectionConfig } from '@solana/web3.js';
import { tap } from 'rxjs';

export const CONNECTION_CONFIG = new InjectionToken<ConnectionConfig>(
  'connectionConfig'
);

export const connectionConfigProviderFactory = (
  config: ConnectionConfig = {}
) => ({
  provide: CONNECTION_CONFIG,
  useValue: {
    commitment: 'confirmed',
    ...config,
  },
});

interface ConnectionState {
  connection: Connection | null;
  endpoint: string | null;
}

@Injectable()
export class ConnectionStore extends ComponentStore<ConnectionState> {
  private readonly _endpoint$ = this.select(
    this.state$,
    ({ endpoint }) => endpoint
  );
  readonly connection$ = this.select(
    this.state$,
    ({ connection }) => connection
  );

  constructor(
    @Optional()
    @Inject(CONNECTION_CONFIG)
    private _config: ConnectionConfig
  ) {
    super({
      connection: null,
      endpoint: null,
    });
  }

  readonly setEndpoint = this.updater((state, endpoint: string) => ({
    ...state,
    endpoint,
  }));

  readonly onEndpointChange = this.effect(() =>
    this._endpoint$.pipe(
      isNotNullOrUndefined,
      tap((endpoint) =>
        this.patchState({
          connection: new Connection(endpoint, this._config),
        })
      )
    )
  );
}
