import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Document, InstructionArgument } from '@heavy-duty/bulldozer-devkit';
import { InstructionArgumentStore } from '@heavy-duty/bulldozer-store';
import { RouteStore } from '@heavy-duty/bulldozer/application/data-access';
import { EditArgumentComponent } from '@heavy-duty/bulldozer/application/features/edit-argument';
import { isTruthy } from '@heavy-duty/rx-solana';
import { ComponentStore } from '@ngrx/component-store';
import { exhaustMap, Observable, tap } from 'rxjs';

@Injectable()
export class InstructionArgumentsListStore extends ComponentStore<object> {
  readonly instructionArguments$ = this.select(
    this._instructionArgumentStore.instructionArguments$,
    this._routeStore.instructionId$,
    (instructionArguments, instructionId) =>
      instructionArguments.filter(
        (instructionArgument) =>
          instructionArgument.data.instruction === instructionId
      )
  );

  constructor(
    private readonly _instructionArgumentStore: InstructionArgumentStore,
    private readonly _matDialog: MatDialog,
    private readonly _routeStore: RouteStore
  ) {
    super({});
  }

  readonly createInstructionArgument = this.effect(
    (
      $: Observable<{
        applicationId: string;
        instructionId: string;
      }>
    ) =>
      $.pipe(
        exhaustMap(({ applicationId, instructionId }) =>
          this._matDialog
            .open(EditArgumentComponent)
            .afterClosed()
            .pipe(
              isTruthy,
              tap((data) =>
                this._instructionArgumentStore.createInstructionArgument({
                  applicationId,
                  instructionId,
                  instructionArgumentDto: data,
                })
              )
            )
        )
      )
  );

  readonly updateInstructionArgument = this.effect(
    ($: Observable<{ instructionArgument: Document<InstructionArgument> }>) =>
      $.pipe(
        exhaustMap(({ instructionArgument }) =>
          this._matDialog
            .open(EditArgumentComponent, { data: { instructionArgument } })
            .afterClosed()
            .pipe(
              isTruthy,
              tap((changes) =>
                this._instructionArgumentStore.updateInstructionArgument({
                  instructionArgumentId: instructionArgument.id,
                  instructionArgumentDto: changes,
                })
              )
            )
        )
      )
  );

  readonly deleteInstructionArgument = this.effect(
    ($: Observable<{ instructionArgument: Document<InstructionArgument> }>) =>
      $.pipe(
        tap(({ instructionArgument }) =>
          this._instructionArgumentStore.deleteInstructionArgument({
            instructionArgumentId: instructionArgument.id,
            instructionId: instructionArgument.data.instruction,
          })
        )
      )
  );
}
