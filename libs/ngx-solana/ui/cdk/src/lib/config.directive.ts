import {
  ChangeDetectorRef,
  Directive,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {
  HdSolanaConfigStore,
  HttpEndpoint,
  NetworkConfig,
} from '@heavy-duty/ngx-solana';
import { Network, WebSocketEndpoint } from '@heavy-duty/ngx-websocket';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';

interface ConfigChanges {
  apiEndpoint: HttpEndpoint | null;
  webSocketEndpoint: WebSocketEndpoint | null;
  networkConfigs: NetworkConfig[] | null;
  selectedNetwork: Network | null;
  selectedNetworkConfig: NetworkConfig | null;
  selectNetwork: (network: Network) => void;
  editNetworkConfig: (networkConfig: NetworkConfig) => void;
}

export class HdSolanaConfigContext implements ConfigChanges {
  public $implicit!: unknown;
  public apiEndpoint!: HttpEndpoint | null;
  public webSocketEndpoint!: WebSocketEndpoint | null;
  public networkConfigs!: NetworkConfig[] | null;
  public selectedNetwork!: Network | null;
  public selectedNetworkConfig!: NetworkConfig | null;
  public selectNetwork!: (network: Network) => void;
  public editNetworkConfig!: (networkConfig: NetworkConfig) => void;
}

@Directive({
  selector: '[hdSolanaConfig]',
})
export class HdSolanaConfigDirective extends ComponentStore<object> {
  private _context: HdSolanaConfigContext = new HdSolanaConfigContext();

  constructor(
    private readonly _changeDetectionRef: ChangeDetectorRef,
    viewContainerRef: ViewContainerRef,
    templateRef: TemplateRef<HdSolanaConfigContext>,
    hdSolanaConfigStore: HdSolanaConfigStore
  ) {
    super({});

    viewContainerRef.createEmbeddedView(templateRef, this._context);
    this._handleChanges(
      this.select(
        hdSolanaConfigStore.apiEndpoint$,
        hdSolanaConfigStore.webSocketEndpoint$,
        hdSolanaConfigStore.networkConfigs$,
        hdSolanaConfigStore.selectedNetwork$,
        hdSolanaConfigStore.selectedNetworkConfig$,
        (
          apiEndpoint,
          webSocketEndpoint,
          networkConfigs,
          selectedNetwork,
          selectedNetworkConfig
        ) => ({
          apiEndpoint,
          webSocketEndpoint,
          networkConfigs,
          selectedNetwork,
          selectedNetworkConfig,
          selectNetwork: (network: Network) => {
            hdSolanaConfigStore.selectNetwork(network);
          },
          editNetworkConfig: (networkConfig: NetworkConfig) => {
            hdSolanaConfigStore.setNetworkConfig(networkConfig);
          },
        }),
        { debounce: true }
      )
    );
  }

  private readonly _handleChanges = this.effect<ConfigChanges>(
    tap(
      ({
        apiEndpoint,
        webSocketEndpoint,
        networkConfigs,
        selectedNetwork,
        selectedNetworkConfig,
        editNetworkConfig,
        selectNetwork,
      }) => {
        this._context.apiEndpoint = apiEndpoint;
        this._context.webSocketEndpoint = webSocketEndpoint;
        this._context.networkConfigs = networkConfigs;
        this._context.selectedNetwork = selectedNetwork;
        this._context.selectedNetworkConfig = selectedNetworkConfig;
        this._context.selectNetwork = selectNetwork;
        this._context.editNetworkConfig = editNetworkConfig;
        this._changeDetectionRef.markForCheck();
      }
    )
  );

  static ngTemplateContextGuard(
    _: HdSolanaConfigDirective,
    ctx: unknown
  ): ctx is HdSolanaConfigContext {
    return true;
  }
}
