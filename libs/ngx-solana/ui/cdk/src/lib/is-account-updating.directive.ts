import {
  ChangeDetectorRef,
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { HdSolanaTransactionsStore } from '@heavy-duty/ngx-solana';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';

export class HdIsAccountUpdatingContext {
  public $implicit!: unknown;
  public status!: boolean;
  public accountId!: string;
}

interface ViewModel {
  accountId: string | null;
}

const initialState: ViewModel = {
  accountId: null,
};

@Directive({
  selector: '[hdIsAccountUpdating]',
})
export class HdIsAccountUpdatingDirective extends ComponentStore<ViewModel> {
  private _context: HdIsAccountUpdatingContext =
    new HdIsAccountUpdatingContext();

  @Input() set hdIsAccountUpdating(accountId: string) {
    this.patchState({ accountId });
    this._context.accountId = accountId;
    this._context.$implicit = this._context;
  }

  constructor(
    private readonly _changeDetectionRef: ChangeDetectorRef,
    private readonly _templateRef: TemplateRef<HdIsAccountUpdatingContext>,
    private readonly _viewContainerRef: ViewContainerRef,
    transactionsStore: HdSolanaTransactionsStore
  ) {
    super(initialState);

    this._handleChanges(
      this.select(
        transactionsStore.transactionStatuses$,
        this.select(({ accountId }) => accountId),
        (transactionStatuses, accountId) => {
          const pendingTransactions = transactionStatuses.filter(
            (transactionStatus) =>
              transactionStatus.confirmationStatus === 'confirmed'
          );

          if (pendingTransactions.length === 0) {
            return false;
          }

          return pendingTransactions.some((transactionStatus) =>
            transactionStatus.transaction?.instructions.some((instruction) =>
              instruction.keys.some(
                ({ pubkey, isWritable }) =>
                  pubkey.toBase58() === accountId && isWritable
              )
            )
          );
        },
        { debounce: true }
      )
    );
  }

  private readonly _handleChanges = this.effect<boolean>(
    tap((status) => {
      this._context.status = status;
      this._context.$implicit = this._context;
      this._updateView();
      this._changeDetectionRef.markForCheck();
    })
  );

  static ngTemplateContextGuard(
    _: HdIsAccountUpdatingDirective,
    ctx: unknown
  ): ctx is HdIsAccountUpdatingContext {
    return true;
  }

  private _updateView() {
    if (this._context.status) {
      this._viewContainerRef.createEmbeddedView(
        this._templateRef,
        this._context
      );
    } else {
      this._viewContainerRef.clear();
    }
  }
}
