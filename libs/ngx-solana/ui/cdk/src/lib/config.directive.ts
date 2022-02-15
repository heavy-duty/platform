import {
  ChangeDetectorRef,
  Directive,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {
  HttpEndpoint,
  NetworkConfig,
  NgxSolanaConfigStore,
} from '@heavy-duty/ngx-solana';
import { Network, WebSocketEndpoint } from '@heavy-duty/ngx-websocket';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, tap } from 'rxjs';

interface ConfigChanges {
  apiEndpoint: HttpEndpoint | null;
  webSocketEndpoint: WebSocketEndpoint | null;
  networkConfigs: NetworkConfig[];
  selectedNetwork: Network | null;
  selectedNetworkConfig: NetworkConfig | null;
}

export class NgxSolanaConfigContext {
  public $implicit!: unknown;
  public apiEndpoint!: HttpEndpoint | null;
  public webSocketEndpoint!: WebSocketEndpoint | null;
  public networkConfigs!: NetworkConfig[];
  public selectedNetwork!: Network | null;
  public selectedNetworkConfig!: NetworkConfig | null;
  public selectNetwork!: (network: Network) => void;
  public editEndpoints!: (
    network: Network,
    endpoints: {
      apiEndpoint: HttpEndpoint;
      webSocketEndpoint: WebSocketEndpoint;
    }
  ) => void;
}

@Directive({
  selector: '[ngxSolanaConfig]',
})
export class NgxSolanaConfigDirective extends ComponentStore<object> {
  private _context: NgxSolanaConfigContext = new NgxSolanaConfigContext();

  constructor(
    private readonly _viewContainerRef: ViewContainerRef,
    private readonly _templateRef: TemplateRef<NgxSolanaConfigContext>,
    private readonly _configStore: NgxSolanaConfigStore,
    private readonly _changeDetectionRef: ChangeDetectorRef
  ) {
    super({});
    this._viewContainerRef.createEmbeddedView(this._templateRef, this._context);
    this.handleChanges(this.changes$);
  }

  readonly changes$: Observable<ConfigChanges> = this.select(
    this._configStore.apiEndpoint$,
    this._configStore.webSocketEndpoint$,
    this._configStore.networkConfigs$,
    this._configStore.selectedNetwork$,
    this._configStore.selectedNetworkConfig$,
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
    }),
    { debounce: true }
  );

  readonly handleChanges = this.effect<ConfigChanges>(
    tap(
      ({
        apiEndpoint,
        webSocketEndpoint,
        networkConfigs,
        selectedNetwork,
        selectedNetworkConfig,
      }) => {
        this._context.apiEndpoint = apiEndpoint;
        this._context.webSocketEndpoint = webSocketEndpoint;
        this._context.networkConfigs = networkConfigs;
        this._context.selectedNetwork = selectedNetwork;
        this._context.selectedNetworkConfig = selectedNetworkConfig;
        this._context.selectNetwork = (network: Network) =>
          this._configStore.selectNetwork(network);
        this._context.editEndpoints = (
          network: Network,
          endpoints: {
            apiEndpoint: HttpEndpoint;
            webSocketEndpoint: WebSocketEndpoint;
          }
        ) =>
          this._configStore.setNetworkConfig({
            network,
            ...endpoints,
          });
        this._changeDetectionRef.markForCheck();
      }
    )
  );

  static ngTemplateContextGuard(
    _: NgxSolanaConfigDirective,
    ctx: unknown
  ): ctx is NgxSolanaConfigContext {
    return true;
  }
}
