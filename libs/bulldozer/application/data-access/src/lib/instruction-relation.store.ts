import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Document,
  InstructionAccount,
  InstructionRelation,
} from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { EditRelationComponent } from '@heavy-duty/bulldozer/application/features/edit-relation';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { concatMap, exhaustMap, filter } from 'rxjs/operators';
import {
  InstructionActions,
  InstructionInit,
  InstructionRelationCreated,
  InstructionRelationDeleted,
  InstructionRelationUpdated,
} from './actions/instruction.actions';

interface ViewModel {
  instructionId: string | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  instructionId: null,
  error: null,
};

@Injectable()
export class InstructionRelationStore extends ComponentStore<ViewModel> {
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
    super(initialState);
  }

  readonly createRelation = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        instructionId: string;
        instructionAccounts: Document<InstructionAccount>[];
      }>
    ) =>
      request$.pipe(
        exhaustMap(
          ({
            workspaceId,
            applicationId,
            instructionId,
            instructionAccounts,
          }) =>
            this._matDialog
              .open(EditRelationComponent, {
                data: { accounts: instructionAccounts },
              })
              .afterClosed()
              .pipe(
                filter((data) => data),
                concatMap(({ from, to }) =>
                  this._bulldozerProgramStore
                    .createInstructionRelation(
                      workspaceId,
                      applicationId,
                      instructionId,
                      from,
                      to
                    )
                    .pipe(
                      tapResponse(
                        () =>
                          this._events.next(new InstructionRelationCreated()),
                        (error) => this._error.next(error)
                      )
                    )
                )
              )
        )
      )
  );

  readonly updateRelation = this.effect(
    (
      request$: Observable<{
        relation: Document<InstructionRelation>;
        instructionAccounts: Document<InstructionAccount>[];
      }>
    ) =>
      request$.pipe(
        exhaustMap(({ relation, instructionAccounts }) =>
          this._matDialog
            .open(EditRelationComponent, {
              data: { relation, accounts: instructionAccounts },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ from, to }) =>
                this._bulldozerProgramStore
                  .updateInstructionRelation(relation.id, from, to)
                  .pipe(
                    tapResponse(
                      () =>
                        this._events.next(
                          new InstructionRelationUpdated(relation.id)
                        ),
                      (error) => this._error.next(error)
                    )
                  )
              )
            )
        )
      )
  );

  readonly deleteRelation = this.effect((relationId$: Observable<string>) =>
    relationId$.pipe(
      concatMap((relationId) =>
        this._bulldozerProgramStore.deleteInstructionRelation(relationId).pipe(
          tapResponse(
            () => this._events.next(new InstructionRelationDeleted(relationId)),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );
}
