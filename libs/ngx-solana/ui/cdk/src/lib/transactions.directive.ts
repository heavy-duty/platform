import {
  ChangeDetectorRef,
  Directive,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {
  HdSolanaTransactionsStore,
  TransactionStatus,
} from '@heavy-duty/ngx-solana';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';

interface TransactionsChanges {
  transactionStatuses: TransactionStatus[] | null;
  transactionsInProcess: number;
}

export class HdSolanaTransactionsContext implements TransactionsChanges {
  public $implicit!: unknown;
  public transactionStatuses: TransactionStatus[] | null = null;
  public transactionsInProcess = 0;
}

@Directive({
  selector: '[hdSolanaTransactions]',
})
export class HdSolanaTransactionsDirective extends ComponentStore<object> {
  private _context: HdSolanaTransactionsContext =
    new HdSolanaTransactionsContext();

  constructor(
    private readonly _changeDetectionRef: ChangeDetectorRef,
    templateRef: TemplateRef<HdSolanaTransactionsContext>,
    viewContainerRef: ViewContainerRef,
    transactionsStore: HdSolanaTransactionsStore
  ) {
    super({});

    viewContainerRef.createEmbeddedView(templateRef, this._context);
    this._handleChanges(
      this.select(
        transactionsStore.transactionStatuses$,
        transactionsStore.transactionsInProcess$,
        (transactionStatuses, transactionsInProcess) => ({
          transactionStatuses,
          transactionsInProcess,
        }),
        { debounce: true }
      )
    );
  }

  private readonly _handleChanges = this.effect<{
    transactionStatuses: TransactionStatus[] | null;
    transactionsInProcess: number;
  }>(
    tap(({ transactionStatuses, transactionsInProcess }) => {
      this._context.transactionStatuses = transactionStatuses;
      this._context.transactionsInProcess = transactionsInProcess;
      this._context.$implicit = this._context;
      this._changeDetectionRef.markForCheck();
    })
  );

  static ngTemplateContextGuard(
    _: HdSolanaTransactionsDirective,
    ctx: unknown
  ): ctx is HdSolanaTransactionsContext {
    return true;
  }
}
