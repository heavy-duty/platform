import {
  ChangeDetectorRef,
  Directive,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { UserInstructionsStore2 } from '@bulldozer-client/users-data-access';
import { InstructionStatus } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore } from '@ngrx/component-store';
import { TransactionSignature } from '@solana/web3.js';
import { List, Set } from 'immutable';
import { tap } from 'rxjs';

interface TransactionsChanges {
  instructionStatuses: List<InstructionStatus> | null;
  instructionInProcessStatuses: List<InstructionStatus> | null;
  instructionNotViewedStatuses: List<InstructionStatus> | null;
  markAsViewed?: () => void;
}

export class UserInstructionsContext implements TransactionsChanges {
  $implicit!: unknown;
  instructionStatuses: List<InstructionStatus> | null = null;
  instructionInProcessStatuses: List<InstructionStatus> | null = null;
  instructionNotViewedStatuses: List<InstructionStatus> | null = null;
  markAsViewed?: () => void;
}

@Directive({
  selector: '[bdUserInstructionsStore]',
})
export class UserInstructionsStoreDirective extends ComponentStore<object> {
  private _context: UserInstructionsContext = new UserInstructionsContext();

  constructor(
    private readonly _changeDetectionRef: ChangeDetectorRef,
    private readonly _userInstructionsStore: UserInstructionsStore2,
    templateRef: TemplateRef<UserInstructionsContext>,
    viewContainerRef: ViewContainerRef
  ) {
    super({});

    this._userInstructionsStore.viewedTransactionSignatures$;
    viewContainerRef.createEmbeddedView(templateRef, this._context);
    this._handleChanges(
      this.select(
        this._userInstructionsStore.groupedInstructionStatuses$,
        this._userInstructionsStore.viewedTransactionSignatures$,
        (groupedInstructionStatuses, viewedTransactionSignatures) => ({
          groupedInstructionStatuses,
          viewedTransactionSignatures,
        }),
        { debounce: true }
      )
    );
  }

  private readonly _handleChanges = this.effect<{
    groupedInstructionStatuses: List<InstructionStatus> | null;
    viewedTransactionSignatures: Set<TransactionSignature>;
  }>(
    tap(({ groupedInstructionStatuses, viewedTransactionSignatures }) => {
      this._context.instructionStatuses = groupedInstructionStatuses;
      this._context.instructionInProcessStatuses =
        groupedInstructionStatuses?.filter(
          (instructionStatus) =>
            instructionStatus.transactionStatus.status !== 'finalized'
        ) ?? null;
      this._context.instructionNotViewedStatuses =
        groupedInstructionStatuses?.filter(
          (instructionStatus) =>
            !viewedTransactionSignatures.some(
              (viewedTransactionSignature) =>
                viewedTransactionSignature ===
                instructionStatus.transactionStatus.signature
            )
        ) ?? null;
      this._context.markAsViewed = () =>
        this._userInstructionsStore.markAsViewed();
      this._context.$implicit = this._context;
      this._changeDetectionRef.markForCheck();
    })
  );

  static ngTemplateContextGuard(
    _: UserInstructionsStoreDirective,
    ctx: unknown
  ): ctx is UserInstructionsContext {
    return true;
  }
}
