import {
  ChangeDetectorRef,
  Directive,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { HdSolanaConnectionStore } from '@heavy-duty/ngx-solana';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';

interface ConnectionChanges {
  online: boolean;
  onlineSince: number | null;
  offlineSince: number | null;
  connected: boolean;
  connecting: boolean;
  connectedAt: number | null;
  nextAttemptAt: number | null;
  reconnect: () => void;
}

export class HdSolanaConnectionContext implements ConnectionChanges {
  public $implicit!: unknown;
  public online!: boolean;
  public onlineSince!: number | null;
  public offlineSince!: number | null;
  public connected!: boolean;
  public connecting!: boolean;
  public connectedAt!: number | null;
  public nextAttemptAt!: number | null;
  public reconnect!: () => void;
}

@Directive({
  selector: '[hdSolanaConnection]',
})
export class HdSolanaConnectionDirective extends ComponentStore<object> {
  private _context: HdSolanaConnectionContext = new HdSolanaConnectionContext();

  constructor(
    private readonly _changeDetectionRef: ChangeDetectorRef,
    templateRef: TemplateRef<HdSolanaConnectionContext>,
    viewContainerRef: ViewContainerRef,
    connectionStore: HdSolanaConnectionStore
  ) {
    super({});

    viewContainerRef.createEmbeddedView(templateRef, this._context);
    this._handleChanges(
      this.select(
        connectionStore.online$,
        connectionStore.onlineSince$,
        connectionStore.offlineSince$,
        connectionStore.connected$,
        connectionStore.connecting$,
        connectionStore.connectedAt$,
        connectionStore.nextAttemptAt$,
        (
          online,
          onlineSince,
          offlineSince,
          connected,
          connecting,
          connectedAt,
          nextAttemptAt
        ) => ({
          online,
          onlineSince,
          offlineSince,
          connected,
          connecting,
          connectedAt,
          nextAttemptAt,
          reconnect: () => connectionStore.reconnect(),
        }),
        { debounce: true }
      )
    );
  }

  private readonly _handleChanges = this.effect<ConnectionChanges>(
    tap(
      ({
        online,
        onlineSince,
        offlineSince,
        connected,
        connectedAt,
        connecting,
        nextAttemptAt,
        reconnect,
      }) => {
        this._context.online = online;
        this._context.onlineSince = onlineSince;
        this._context.offlineSince = offlineSince;
        this._context.connected = connected;
        this._context.connectedAt = connectedAt;
        this._context.connecting = connecting;
        this._context.nextAttemptAt = nextAttemptAt;
        this._context.reconnect = reconnect;
        this._changeDetectionRef.markForCheck();
      }
    )
  );

  static ngTemplateContextGuard(
    _: HdSolanaConnectionDirective,
    ctx: unknown
  ): ctx is HdSolanaConnectionContext {
    return true;
  }
}
