import { Injectable } from '@angular/core';
import {
  Document,
  InstructionRelation,
  InstructionRelationDto,
} from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { concatMap, switchMap, tap } from 'rxjs/operators';
import {
  InstructionActions,
  InstructionInit,
  InstructionRelationCreated,
  InstructionRelationDeleted,
  InstructionRelationUpdated,
} from './actions/instruction.actions';

interface ViewModel {
  instructionId: string | null;
  instructionRelationsMap: Map<string, Document<InstructionRelation>>;
}

const initialState: ViewModel = {
  instructionId: null,
  instructionRelationsMap: new Map<string, Document<InstructionRelation>>(),
};

@Injectable()
export class InstructionRelationStore extends ComponentStore<ViewModel> {
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _events = new BehaviorSubject<InstructionActions>(
    new InstructionInit()
  );
  readonly events$ = this._events.asObservable();
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);
  readonly instructionRelationsMap$ = this.select(
    ({ instructionRelationsMap }) => instructionRelationsMap
  );
  readonly instructionRelations$ = this.select(
    this.instructionRelationsMap$,
    (instructionRelationsMap) =>
      Array.from(
        instructionRelationsMap,
        ([, instructionRelation]) => instructionRelation
      )
  );

  constructor(private readonly _bulldozerProgramStore: BulldozerProgramStore) {
    super(initialState);
  }

  private readonly _setInstructionRelation = this.updater(
    (state, newInstructionRelation: Document<InstructionRelation>) => {
      const instructionRelationsMap = new Map(state.instructionRelationsMap);
      instructionRelationsMap.set(
        newInstructionRelation.id,
        newInstructionRelation
      );
      return {
        ...state,
        instructionRelationsMap,
      };
    }
  );

  private readonly _addInstructionRelation = this.updater(
    (state, newInstructionRelation: Document<InstructionRelation>) => {
      if (state.instructionRelationsMap.has(newInstructionRelation.id)) {
        return state;
      }
      const instructionRelationsMap = new Map(state.instructionRelationsMap);
      instructionRelationsMap.set(
        newInstructionRelation.id,
        newInstructionRelation
      );
      return {
        ...state,
        instructionRelationsMap,
      };
    }
  );

  private readonly _removeInstructionRelation = this.updater(
    (state, instructionRelationId: string) => {
      const instructionRelationsMap = new Map(state.instructionRelationsMap);
      instructionRelationsMap.delete(instructionRelationId);
      return {
        ...state,
        instructionRelationsMap,
      };
    }
  );

  readonly watchInstructionRelations = this.effect(() =>
    this.instructionRelations$.pipe(
      switchMap((instructionRelations) =>
        merge(
          ...instructionRelations.map((instructionRelation) =>
            this._bulldozerProgramStore
              .onInstructionRelationUpdated(instructionRelation.id)
              .pipe(
                tap((changes) => {
                  if (!changes) {
                    this._removeInstructionRelation(instructionRelation.id);
                  } else {
                    this._setInstructionRelation(changes);
                  }
                })
              )
          )
        )
      )
    )
  );

  readonly onInstructionRelationByInstructionChanges = this.effect(() =>
    this.instructionId$.pipe(
      isNotNullOrUndefined,
      switchMap((instructionId) =>
        this._bulldozerProgramStore
          .onInstructionRelationByInstructionChanges(instructionId)
          .pipe(
            tap((instructionRelation) =>
              this._addInstructionRelation(instructionRelation)
            )
          )
      )
    )
  );

  readonly setInstructionId = this.updater(
    (state, instructionId: string | null) => ({
      ...state,
      instructionId,
    })
  );

  readonly loadInstructionRelations = this.effect(() =>
    this.instructionId$.pipe(
      isNotNullOrUndefined,
      concatMap((instructionId) =>
        this._bulldozerProgramStore
          .getInstructionRelationsByInstruction(instructionId)
          .pipe(
            tapResponse(
              (instructionRelations) =>
                this.patchState({
                  instructionRelationsMap: instructionRelations.reduce(
                    (instructionRelationsMap, instructionRelation) =>
                      instructionRelationsMap.set(
                        instructionRelation.id,
                        instructionRelation
                      ),
                    new Map<string, Document<InstructionRelation>>()
                  ),
                }),
              (error) => this._error.next(error)
            )
          )
      )
    )
  );

  readonly createInstructionRelation = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        instructionId: string;
        data: InstructionRelationDto;
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
        changes: InstructionRelationDto;
      }>
    ) =>
      request$.pipe(
        concatMap(({ instructionRelation, changes: { from, to } }) =>
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
    (instructionRelationId$: Observable<string>) =>
      instructionRelationId$.pipe(
        concatMap((instructionRelationId) =>
          this._bulldozerProgramStore
            .deleteInstructionRelation(instructionRelationId)
            .pipe(
              tapResponse(
                () =>
                  this._events.next(
                    new InstructionRelationDeleted(instructionRelationId)
                  ),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  reload() {
    // this._reload.next(null);
  }
}
