import {
  ChangeDetectorRef,
  Directive,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';

interface BroadcasterStatusChanges {
  online: boolean;
  connected: boolean;
}

export class HdBroadcasterStatusContext implements BroadcasterStatusChanges {
  $implicit!: unknown;
  online = false;
  connected = false;
}

@Directive({
  selector: '[hdBroadcasterStatus]',
})
export class HdBroadcasterStatusDirective extends ComponentStore<object> {
  private _context: HdBroadcasterStatusContext =
    new HdBroadcasterStatusContext();
  private readonly _changes$ = this.select(
    this._hdBroadcasterSocketStore.online$,
    this._hdBroadcasterSocketStore.connected$,
    (online, connected) => ({
      online,
      connected,
    }),
    { debounce: true }
  );

  constructor(
    private readonly _changeDetectionRef: ChangeDetectorRef,
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    templateRef: TemplateRef<HdBroadcasterStatusContext>,
    viewContainerRef: ViewContainerRef
  ) {
    super({});

    viewContainerRef.createEmbeddedView(templateRef, this._context);
    this._handleChanges(this._changes$);
  }

  private readonly _handleChanges = this.effect<BroadcasterStatusChanges>(
    tap(({ online, connected }) => {
      this._context.online = online;
      this._context.connected = connected;
      this._changeDetectionRef.markForCheck();
    })
  );

  static ngTemplateContextGuard(
    _: HdBroadcasterStatusDirective,
    ctx: unknown
  ): ctx is HdBroadcasterStatusContext {
    return true;
  }
}
