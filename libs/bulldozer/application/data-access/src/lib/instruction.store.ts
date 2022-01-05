import { Injectable } from '@angular/core';
import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  BehaviorSubject,
  concatMap,
  merge,
  Observable,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import {
  InstructionActions,
  InstructionCreated,
  InstructionDeleted,
  InstructionInit,
  InstructionUpdated,
} from './actions/instruction.actions';

interface ViewModel {
  instructionId: string | null;
  instructionsMap: Map<string, Document<Instruction>>;
}

const initialState: ViewModel = {
  instructionId: null,
  instructionsMap: new Map<string, Document<Instruction>>(),
};

@Injectable()
export class InstructionStore extends ComponentStore<ViewModel> {
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _events = new BehaviorSubject<InstructionActions>(
    new InstructionInit()
  );
  readonly events$ = this._events.asObservable();
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);
  readonly instructionsMap$ = this.select(
    ({ instructionsMap }) => instructionsMap
  );
  readonly instructions$ = this.select(
    this.instructionsMap$,
    (instructionsMap) =>
      Array.from(instructionsMap, ([, instruction]) => instruction)
  );
  readonly instruction$ = this.select(
    this.instructionsMap$,
    this.instructionId$,
    (instructions, instructionId) =>
      (instructionId && instructions.get(instructionId)) || null
  );

  constructor(private readonly _bulldozerProgramStore: BulldozerProgramStore) {
    super(initialState);
  }

  private readonly _setInstruction = this.updater(
    (state, newInstruction: Document<Instruction>) => {
      const instructionsMap = new Map(state.instructionsMap);
      instructionsMap.set(newInstruction.id, newInstruction);
      return {
        ...state,
        instructionsMap,
      };
    }
  );

  private readonly _addInstruction = this.updater(
    (state, newInstruction: Document<Instruction>) => {
      if (state.instructionsMap.has(newInstruction.id)) {
        return state;
      }
      const instructionsMap = new Map(state.instructionsMap);
      instructionsMap.set(newInstruction.id, newInstruction);
      return {
        ...state,
        instructionsMap,
      };
    }
  );

  private readonly _removeInstruction = this.updater(
    (state, instructionId: string) => {
      const instructionsMap = new Map(state.instructionsMap);
      instructionsMap.delete(instructionId);
      return {
        ...state,
        instructionsMap,
      };
    }
  );

  private readonly _watchInstructions = this.effect(
    (instructions$: Observable<Document<Instruction>[]>) =>
      instructions$.pipe(
        switchMap((instructions) =>
          merge(
            ...instructions.map((instruction) =>
              this._bulldozerProgramStore
                .onInstructionUpdated(instruction.id)
                .pipe(
                  tap((changes) => {
                    if (!changes) {
                      this._removeInstruction(instruction.id);
                    } else {
                      this._setInstruction(changes);
                    }
                  })
                )
            )
          )
        )
      )
  );

  private readonly _onInstructionByApplicationChanges = this.effect(
    (applicationId$: Observable<string>) =>
      applicationId$.pipe(
        switchMap((workspaceId) =>
          this._bulldozerProgramStore
            .onInstructionByApplicationChanges(workspaceId)
            .pipe(tap((instruction) => this._addInstruction(instruction)))
        )
      )
  );

  readonly setInstructionId = this.effect(
    (instructionId$: Observable<string | null>) =>
      instructionId$.pipe(
        tap((instructionId) => this.patchState({ instructionId }))
      )
  );

  readonly loadInstructions = this.effect(
    (applicationId$: Observable<string>) =>
      applicationId$.pipe(
        concatMap((applicationId) =>
          this._bulldozerProgramStore
            .getInstructionsByApplication(applicationId)
            .pipe(
              tapResponse(
                (instructions) => {
                  this.patchState({
                    instructionsMap: instructions.reduce(
                      (instructionsMap, instruction) =>
                        instructionsMap.set(instruction.id, instruction),
                      new Map<string, Document<Instruction>>()
                    ),
                  });
                  this._watchInstructions(instructions);
                  this._onInstructionByApplicationChanges(applicationId);
                },
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly createInstruction = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        data: { name: string };
      }>
    ) =>
      request$.pipe(
        concatMap(({ workspaceId, applicationId, data }) =>
          this._bulldozerProgramStore
            .createInstruction(workspaceId, applicationId, data.name)
            .pipe(
              tapResponse(
                () => this._events.next(new InstructionCreated()),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly updateInstruction = this.effect(
    (
      request$: Observable<{
        instruction: Document<Instruction>;
        changes: { name: string };
      }>
    ) =>
      request$.pipe(
        concatMap(({ instruction, changes }) =>
          this._bulldozerProgramStore
            .updateInstruction(instruction.id, changes.name)
            .pipe(
              tapResponse(
                () => this._events.next(new InstructionUpdated(instruction.id)),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly updateInstructionBody = this.effect(
    (
      request$: Observable<{ instruction: Document<Instruction>; body: string }>
    ) =>
      request$.pipe(
        concatMap(({ instruction, body }) =>
          this._bulldozerProgramStore
            .updateInstructionBody(instruction.id, body)
            .pipe(
              tapResponse(
                () => this._events.next(new InstructionUpdated(instruction.id)),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly deleteInstruction = this.effect(
    (instruction$: Observable<Document<Instruction>>) =>
      instruction$.pipe(
        concatMap((instruction) =>
          this._bulldozerProgramStore
            .deleteInstruction(instruction.data.application, instruction.id)
            .pipe(
              tapResponse(
                () => this._events.next(new InstructionDeleted(instruction.id)),
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
