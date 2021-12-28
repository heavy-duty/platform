import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Document, InstructionArgument } from '@heavy-duty/bulldozer-devkit';
import { EditArgumentComponent } from '@heavy-duty/bulldozer/application/features/edit-argument';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer/data-access';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { concatMap, exhaustMap, filter } from 'rxjs/operators';
import {
  InstructionActions,
  InstructionArgumentCreated,
  InstructionArgumentDeleted,
  InstructionArgumentUpdated,
  InstructionInit,
} from './actions/instruction.actions';

@Injectable()
export class InstructionArgumentStore extends ComponentStore<object> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _events = new BehaviorSubject<InstructionActions>(
    new InstructionInit()
  );
  readonly events$ = this._events.asObservable();

  constructor(
    private readonly _matDialog: MatDialog,
    private readonly _bulldozerProgramStore: BulldozerProgramStore
  ) {
    super({});
  }

  readonly createArgument = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        instructionId: string;
      }>
    ) =>
      request$.pipe(
        exhaustMap(({ workspaceId, applicationId, instructionId }) =>
          this._matDialog
            .open(EditArgumentComponent)
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name }) =>
                this._bulldozerProgramStore.createInstructionArgument(
                  workspaceId,
                  applicationId,
                  instructionId,
                  name
                )
              ),
              tapResponse(
                () => this._events.next(new InstructionArgumentCreated()),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly updateArgument = this.effect(
    (argument$: Observable<Document<InstructionArgument>>) =>
      argument$.pipe(
        exhaustMap((argument) =>
          this._matDialog
            .open(EditArgumentComponent, {
              data: { argument },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name }) =>
                this._bulldozerProgramStore.updateInstructionArgument(
                  argument.id,
                  name
                )
              ),
              tapResponse(
                () =>
                  this._events.next(
                    new InstructionArgumentUpdated(argument.id)
                  ),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly deleteArgument = this.effect((argumentId$: Observable<string>) =>
    argumentId$.pipe(
      concatMap((argumentId) =>
        this._bulldozerProgramStore.deleteInstructionArgument(argumentId).pipe(
          tapResponse(
            () => this._events.next(new InstructionArgumentDeleted(argumentId)),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );
}
