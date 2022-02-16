import { Injectable } from '@angular/core';
import { WebSocketEndpoint } from '@heavy-duty/ngx-websocket';
import { LocalStorageSubject } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { pipe, tap } from 'rxjs';

export type Network = 'localhost' | 'devnet' | 'testnet' | 'mainnet-beta';

type HttpProtocol = 'http' | 'https';

type Url = string;
export type HttpEndpoint = `${HttpProtocol}://${Url}`;

export interface NetworkConfig {
  network: Network;
  apiEndpoint: HttpEndpoint;
  webSocketEndpoint: WebSocketEndpoint;
}

const defaultNetworkConfigs: NetworkConfig[] = [
  {
    network: 'localhost',
    apiEndpoint: 'http://localhost:8899',
    webSocketEndpoint: 'ws://localhost:8900',
  },
  {
    network: 'devnet',
    apiEndpoint: 'https://api.devnet.solana.com',
    webSocketEndpoint: 'wss://api.devnet.solana.com',
  },
  {
    network: 'testnet',
    apiEndpoint: 'https://api.testnet.solana.com',
    webSocketEndpoint: 'wss://api.testnet.solana.com',
  },
  {
    network: 'mainnet-beta',
    apiEndpoint: 'https://api.mainnet-beta.solana.com',
    webSocketEndpoint: 'wss://api.mainnet-beta.solana.com',
  },
];

const defaultSelectedNetwork = 'localhost';

interface ViewModel {
  configs: NetworkConfig[] | null;
  selectedNetwork: Network | null;
}

@Injectable()
export class HdSolanaConfigStore extends ComponentStore<ViewModel> {
  private readonly _networkConfigs = new LocalStorageSubject<NetworkConfig[]>(
    'networkConfigs'
  );
  private readonly _selectedNetwork = new LocalStorageSubject<Network>(
    'selectedNetwork'
  );
  readonly networkConfigs$ = this.select(({ configs }) => configs);
  readonly selectedNetwork$ = this.select(
    ({ selectedNetwork }) => selectedNetwork
  );
  readonly selectedNetworkConfig$ = this.select(
    this.networkConfigs$,
    this.selectedNetwork$,
    (networkConfigs, selectedNetwork) =>
      networkConfigs?.find(
        (networkConfig) => networkConfig.network === selectedNetwork
      ) ?? null
  );
  readonly apiEndpoint$ = this.select(
    this.selectedNetworkConfig$,
    (selectedNetwork) => selectedNetwork?.apiEndpoint ?? null
  );
  readonly webSocketEndpoint$ = this.select(
    this.selectedNetworkConfig$,
    (selectedNetwork) => selectedNetwork?.webSocketEndpoint ?? null
  );

  constructor() {
    super({
      configs: null,
      selectedNetwork: null,
    });

    this._persistConfigChanges(this.networkConfigs$);
    this._persistSelectedNetwork(this.selectedNetwork$);
    this._loadSelectedNetwork(this._selectedNetwork.asObservable());
    this._loadConfigs(this._networkConfigs.asObservable());
  }

  private readonly _loadConfigs = this.effect<NetworkConfig[] | null>(
    pipe(
      tap((configs) => {
        if (configs === null) {
          this._networkConfigs.next(defaultNetworkConfigs);
        } else {
          this.patchState({ configs });
        }
      })
    )
  );

  private readonly _loadSelectedNetwork = this.effect<Network | null>(
    pipe(
      tap((selectedNetwork) => {
        if (selectedNetwork === null) {
          this._selectedNetwork.next(defaultSelectedNetwork);
        } else {
          this.patchState({ selectedNetwork });
        }
      })
    )
  );

  private readonly _persistConfigChanges = this.effect<NetworkConfig[] | null>(
    tap(this._networkConfigs)
  );

  private readonly _persistSelectedNetwork = this.effect<Network | null>(
    tap(this._selectedNetwork)
  );

  readonly setNetworkConfig = this.updater<NetworkConfig | null>(
    (state, networkConfig) => ({
      ...state,
      configs:
        state.configs?.map((config) =>
          config.network === networkConfig?.network ? networkConfig : config
        ) ?? null,
    })
  );

  readonly selectNetwork = this.updater<Network | null>(
    (state, selectedNetwork) => ({
      ...state,
      selectedNetwork,
    })
  );
}
