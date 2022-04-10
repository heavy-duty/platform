import {
  ChangeDetectorRef,
  Directive,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { HdBroadcasterStore, TransactionStatus } from '@heavy-duty/broadcaster';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';

interface BroadcasterChanges {
  transactionStatuses: TransactionStatus[] | null;
  transactionsInProcess: number;
}

export class HdBroadcasterContext implements BroadcasterChanges {
  $implicit!: unknown;
  transactionStatuses: TransactionStatus[] | null = null;
  transactionsInProcess = 0;
}

@Directive({
  selector: '[hdBroadcaster]',
})
export class HdBroadcasterDirective extends ComponentStore<object> {
  private _context: HdBroadcasterContext = new HdBroadcasterContext();
  private readonly _changes$ = this.select(
    this._hdBroadcasterStore.transactionStatuses$,
    this._hdBroadcasterStore.transactionsInProcess$,
    (transactionStatuses, transactionsInProcess) => ({
      transactionStatuses,
      transactionsInProcess,
    }),
    { debounce: true }
  );

  constructor(
    private readonly _changeDetectionRef: ChangeDetectorRef,
    private readonly _hdBroadcasterStore: HdBroadcasterStore,
    templateRef: TemplateRef<HdBroadcasterContext>,
    viewContainerRef: ViewContainerRef
  ) {
    super({});

    viewContainerRef.createEmbeddedView(templateRef, this._context);
    // this._handleChanges(this._changes$);
  }

  private readonly _handleChanges = this.effect<BroadcasterChanges>(
    tap(({ transactionStatuses, transactionsInProcess }) => {
      this._context.transactionStatuses = transactionStatuses;
      this._context.transactionsInProcess = transactionsInProcess;
      this._changeDetectionRef.markForCheck();
    })
  );

  static ngTemplateContextGuard(
    _: HdBroadcasterDirective,
    ctx: unknown
  ): ctx is HdBroadcasterContext {
    return true;
  }
}
