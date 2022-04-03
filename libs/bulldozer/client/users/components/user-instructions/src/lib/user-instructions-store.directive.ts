import {
  ChangeDetectorRef,
  Directive,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {
  InstructionStatus,
  UserInstructionsStore,
} from '@bulldozer-client/users-data-access';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';

interface TransactionsChanges {
  instructionStatuses: InstructionStatus[] | null;
  instructionInProcessStatuses: InstructionStatus[] | null;
  instructionNotViewedStatuses: InstructionStatus[] | null;
  markAsViewed: () => void;
}

export class UserInstructionsContext implements TransactionsChanges {
  $implicit!: unknown;
  instructionStatuses: InstructionStatus[] | null = null;
  instructionInProcessStatuses: InstructionStatus[] | null = null;
  instructionNotViewedStatuses: InstructionStatus[] | null = null;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  markAsViewed: () => void = () => {};
}

@Directive({
  selector: '[bdUserInstructionsStore]',
})
export class UserInstructionsStoreDirective extends ComponentStore<object> {
  private _context: UserInstructionsContext = new UserInstructionsContext();

  constructor(
    private readonly _changeDetectionRef: ChangeDetectorRef,
    private readonly _userInstructionsStore: UserInstructionsStore,
    templateRef: TemplateRef<UserInstructionsContext>,
    viewContainerRef: ViewContainerRef
  ) {
    super({});

    viewContainerRef.createEmbeddedView(templateRef, this._context);
    this._handleChanges(
      this.select(
        this._userInstructionsStore.instructionStatuses$,
        this._userInstructionsStore.instructionsInProcess$,
        (instructionStatuses, instructionsInProcess) => ({
          instructionStatuses,
          instructionsInProcess,
        }),
        { debounce: true }
      )
    );
  }

  private readonly _handleChanges = this.effect<{
    instructionStatuses: InstructionStatus[] | null;
    instructionsInProcess: number;
  }>(
    tap(({ instructionStatuses }) => {
      this._context.instructionStatuses = instructionStatuses;
      this._context.instructionInProcessStatuses =
        instructionStatuses?.filter(
          (instructionStatus) => instructionStatus.status !== 'finalized'
        ) ?? null;
      this._context.instructionNotViewedStatuses =
        instructionStatuses?.filter(
          (instructionStatus) => !instructionStatus.viewed
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
