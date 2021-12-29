import { Injectable } from '@angular/core';
import { Document, InstructionRelation } from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
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

  constructor(private readonly _bulldozerProgramStore: BulldozerProgramStore) {
    super(initialState);
  }

  readonly createInstructionRelation = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        instructionId: string;
        data: { from: string; to: string };
      }>
    ) =>
      request$.pipe(
        concatMap(
          ({ workspaceId, applicationId, instructionId, data: { from, to } }) =>
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
                  () => this._events.next(new InstructionRelationCreated()),
                  (error) => this._error.next(error)
                )
              )
        )
      )
  );

  readonly updateInstructionRelation = this.effect(
    (
      request$: Observable<{
        instructionRelation: Document<InstructionRelation>;
        changes: { from: string; to: string };
      }>
    ) =>
      request$.pipe(
        concatMap(({ changes: { from, to }, instructionRelation }) =>
          this._bulldozerProgramStore
            .updateInstructionRelation(instructionRelation.id, from, to)
            .pipe(
              tapResponse(
                () =>
                  this._events.next(
                    new InstructionRelationUpdated(instructionRelation.id)
                  ),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly deleteInstructionRelation = this.effect(
    (relationId$: Observable<string>) =>
      relationId$.pipe(
        concatMap((relationId) =>
          this._bulldozerProgramStore
            .deleteInstructionRelation(relationId)
            .pipe(
              tapResponse(
                () =>
                  this._events.next(new InstructionRelationDeleted(relationId)),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );
}
