import {
  ChangeDetectorRef,
  Directive,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { NgxSolanaConnectionStore } from '@heavy-duty/ngx-solana';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, tap } from 'rxjs';

interface ConnectionChanges {
  online: boolean;
  onlineSince: number | null;
  offlineSince: number | null;
  connected: boolean;
  connecting: boolean;
  connectedAt: number | null;
  nextAttemptAt: number | null;
}

export class NgxSolanaConnectionContext {
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
  selector: '[ngxSolanaConnection]',
})
export class NgxSolanaConnectionDirective extends ComponentStore<object> {
  private _context: NgxSolanaConnectionContext =
    new NgxSolanaConnectionContext();

  constructor(
    private readonly _viewContainerRef: ViewContainerRef,
    private readonly _templateRef: TemplateRef<NgxSolanaConnectionContext>,
    private readonly _connectionStore: NgxSolanaConnectionStore,
    private readonly _changeDetectionRef: ChangeDetectorRef
  ) {
    super({});
    this._viewContainerRef.createEmbeddedView(this._templateRef, this._context);
    this._handleChanges(this._changes$);
  }

  private readonly _changes$: Observable<ConnectionChanges> = this.select(
    this._connectionStore.online$,
    this._connectionStore.onlineSince$,
    this._connectionStore.offlineSince$,
    this._connectionStore.connected$,
    this._connectionStore.connecting$,
    this._connectionStore.connectedAt$,
    this._connectionStore.nextAttemptAt$,
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
    }),
    { debounce: true }
  );

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
      }) => {
        this._context.online = online;
        this._context.onlineSince = onlineSince;
        this._context.offlineSince = offlineSince;
        this._context.connected = connected;
        this._context.connectedAt = connectedAt;
        this._context.connecting = connecting;
        this._context.nextAttemptAt = nextAttemptAt;
        this._context.reconnect = () => this._connectionStore.reconnect();
        this._changeDetectionRef.markForCheck();
      }
    )
  );

  static ngTemplateContextGuard(
    _: NgxSolanaConnectionDirective,
    ctx: unknown
  ): ctx is NgxSolanaConnectionContext {
    return true;
  }
}
