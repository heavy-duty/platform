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
  instructionsInProcess: number;
}

export class UserInstructionsContext implements TransactionsChanges {
  public $implicit!: unknown;
  public instructionStatuses: InstructionStatus[] | null = null;
  public instructionsInProcess = 0;
}

@Directive({
  selector: '[bdUserInstructionsStore]',
})
export class UserInstructionsStoreDirective extends ComponentStore<object> {
  private _context: UserInstructionsContext = new UserInstructionsContext();

  constructor(
    private readonly _changeDetectionRef: ChangeDetectorRef,
    templateRef: TemplateRef<UserInstructionsContext>,
    viewContainerRef: ViewContainerRef,
    userInstructionsStore: UserInstructionsStore
  ) {
    super({});

    viewContainerRef.createEmbeddedView(templateRef, this._context);
    this._handleChanges(
      this.select(
        userInstructionsStore.instructionStatuses$,
        userInstructionsStore.instructionsInProcess$,
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
    tap(({ instructionStatuses, instructionsInProcess }) => {
      this._context.instructionStatuses = instructionStatuses;
      this._context.instructionsInProcess = instructionsInProcess;
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
