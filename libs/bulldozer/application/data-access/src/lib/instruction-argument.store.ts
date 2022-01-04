import { Injectable } from '@angular/core';
import {
  Document,
  InstructionArgument,
  InstructionArgumentDto,
} from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { concatMap, switchMap, tap } from 'rxjs/operators';
import {
  InstructionActions,
  InstructionArgumentCreated,
  InstructionArgumentDeleted,
  InstructionArgumentUpdated,
  InstructionInit,
} from './actions/instruction.actions';

interface ViewModel {
  instructionArgumentsMap: Map<string, Document<InstructionArgument>>;
}

const initialState: ViewModel = {
  instructionArgumentsMap: new Map<string, Document<InstructionArgument>>(),
};

@Injectable()
export class InstructionArgumentStore extends ComponentStore<ViewModel> {
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _events = new BehaviorSubject<InstructionActions>(
    new InstructionInit()
  );
  readonly events$ = this._events.asObservable();
  readonly instructionArgumentsMap$ = this.select(
    ({ instructionArgumentsMap }) => instructionArgumentsMap
  );
  readonly instructionArguments$ = this.select(
    this.instructionArgumentsMap$,
    (instructionArgumentsMap) =>
      Array.from(
        instructionArgumentsMap,
        ([, instructionArgument]) => instructionArgument
      )
  );

  constructor(private readonly _bulldozerProgramStore: BulldozerProgramStore) {
    super(initialState);
  }

  private readonly _setInstructionArgument = this.updater(
    (state, newInstructionArgument: Document<InstructionArgument>) => {
      const instructionArgumentsMap = new Map(state.instructionArgumentsMap);
      instructionArgumentsMap.set(
        newInstructionArgument.id,
        newInstructionArgument
      );
      return {
        ...state,
        instructionArgumentsMap,
      };
    }
  );

  private readonly _addInstructionArgument = this.updater(
    (state, newInstructionArgument: Document<InstructionArgument>) => {
      if (state.instructionArgumentsMap.has(newInstructionArgument.id)) {
        return state;
      }
      const instructionArgumentsMap = new Map(state.instructionArgumentsMap);
      instructionArgumentsMap.set(
        newInstructionArgument.id,
        newInstructionArgument
      );
      return {
        ...state,
        instructionArgumentsMap,
      };
    }
  );

  private readonly _removeInstructionArgument = this.updater(
    (state, instructionArgumentId: string) => {
      const instructionArgumentsMap = new Map(state.instructionArgumentsMap);
      instructionArgumentsMap.delete(instructionArgumentId);
      return {
        ...state,
        instructionArgumentsMap,
      };
    }
  );

  private readonly _watchInstructionArguments = this.effect(
    (instructionArguments$: Observable<Document<InstructionArgument>[]>) =>
      instructionArguments$.pipe(
        switchMap((instructionArguments) =>
          merge(
            ...instructionArguments.map((instructionArgument) =>
              this._bulldozerProgramStore
                .onInstructionArgumentUpdated(instructionArgument.id)
                .pipe(
                  tap((changes) => {
                    if (!changes) {
                      this._removeInstructionArgument(instructionArgument.id);
                    } else {
                      this._setInstructionArgument(changes);
                    }
                  })
                )
            )
          )
        )
      )
  );

  private readonly _onInstructionArgumentByInstructionChanges = this.effect(
    (instructionId$: Observable<string>) =>
      instructionId$.pipe(
        switchMap((instructionId) =>
          this._bulldozerProgramStore
            .onInstructionArgumentByInstructionChanges(instructionId)
            .pipe(
              tap((instructionArgument) =>
                this._addInstructionArgument(instructionArgument)
              )
            )
        )
      )
  );

  readonly loadInstructionArguments = this.effect(
    (instructionId$: Observable<string>) =>
      instructionId$.pipe(
        concatMap((instructionId) =>
          this._bulldozerProgramStore
            .getInstructionArgumentsByInstruction(instructionId)
            .pipe(
              tapResponse(
                (instructionArguments) => {
                  this.patchState({
                    instructionArgumentsMap: instructionArguments.reduce(
                      (instructionArgumentsMap, instructionArgument) =>
                        instructionArgumentsMap.set(
                          instructionArgument.id,
                          instructionArgument
                        ),
                      new Map<string, Document<InstructionArgument>>()
                    ),
                  });
                  this._watchInstructionArguments(instructionArguments);
                  this._onInstructionArgumentByInstructionChanges(
                    instructionId
                  );
                },
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly createInstructionArgument = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        instructionId: string;
        data: InstructionArgumentDto;
      }>
    ) =>
      request$.pipe(
        concatMap(({ workspaceId, applicationId, instructionId, data }) =>
          this._bulldozerProgramStore
            .createInstructionArgument(
              workspaceId,
              applicationId,
              instructionId,
              data
            )
            .pipe(
              tapResponse(
                () => this._events.next(new InstructionArgumentCreated()),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly updateInstructionArgument = this.effect(
    (
      request$: Observable<{
        instructionArgument: Document<InstructionArgument>;
        changes: InstructionArgumentDto;
      }>
    ) =>
      request$.pipe(
        concatMap(({ instructionArgument, changes }) =>
          this._bulldozerProgramStore
            .updateInstructionArgument(instructionArgument.id, changes)
            .pipe(
              tapResponse(
                () =>
                  this._events.next(
                    new InstructionArgumentUpdated(instructionArgument.id)
                  ),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly deleteInstructionArgument = this.effect(
    (argumentId$: Observable<string>) =>
      argumentId$.pipe(
        concatMap((argumentId) =>
          this._bulldozerProgramStore
            .deleteInstructionArgument(argumentId)
            .pipe(
              tapResponse(
                () =>
                  this._events.next(new InstructionArgumentDeleted(argumentId)),
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
