import { Injectable } from '@angular/core';
import { WebSocketEndpoint } from '@heavy-duty/ngx-websocket';
import { LocalStorageSubject } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';

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
  configs: NetworkConfig[];
  selectedNetwork: Network | null;
}

@Injectable()
export class NgxSolanaConfigStore extends ComponentStore<ViewModel> {
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
      networkConfigs.find(
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
      configs: [],
      selectedNetwork: null,
    });
  }

  readonly setNetworkConfig = this.updater(
    (state, networkConfig: NetworkConfig) => ({
      ...state,
      configs: state.configs.map((config) =>
        config.network === networkConfig.network ? networkConfig : config
      ),
    })
  );

  readonly selectNetwork = this.updater(
    (state, selectedNetwork: Network | null) => ({
      ...state,
      selectedNetwork,
    })
  );

  readonly loadConfigs = this.effect(() =>
    this._networkConfigs.asObservable().pipe(
      tap((configs) => {
        if (configs !== null) {
          this.patchState({ configs });
        } else {
          this._networkConfigs.next(defaultNetworkConfigs);
        }
      })
    )
  );

  readonly loadSelectedNetwork = this.effect(() =>
    this._selectedNetwork.asObservable().pipe(
      tap((selectedNetwork) => {
        if (selectedNetwork !== null) {
          this.patchState({ selectedNetwork });
        } else {
          this._selectedNetwork.next(defaultSelectedNetwork);
        }
      })
    )
  );

  readonly persistConfigChanges = this.effect(() =>
    this.networkConfigs$.pipe(tap(this._networkConfigs))
  );

  readonly persistSelectedNetwork = this.effect(() =>
    this.selectedNetwork$.pipe(tap(this._selectedNetwork))
  );
}
