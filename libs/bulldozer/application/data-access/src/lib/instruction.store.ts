import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
import { EditInstructionComponent } from '@heavy-duty/bulldozer/application/features/edit-instruction';
import { generateInstructionCode } from '@heavy-duty/bulldozer/application/utils/services/code-generator';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  BehaviorSubject,
  concatMap,
  exhaustMap,
  filter,
  Observable,
  Subject,
  tap,
  withLatestFrom,
} from 'rxjs';
import {
  InstructionActions,
  InstructionCreated,
  InstructionDeleted,
  InstructionInit,
  InstructionUpdated,
} from './actions/instruction.actions';
import { ApplicationStore } from './application.store';
import { WorkspaceStore } from './workspace.store';

interface ViewModel {
  instructionId: string | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  instructionId: null,
  error: null,
};

@Injectable()
export class InstructionStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _events = new BehaviorSubject<InstructionActions>(
    new InstructionInit()
  );
  readonly events$ = this._events.asObservable();
  readonly instructions$ = this.select(
    this._workspaceStore.instructions$,
    this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
    (instructions, applicationId) =>
      instructions.filter(({ data }) => data.application === applicationId)
  );
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);
  readonly instruction$ = this.select(
    this.instructions$,
    this.instructionId$,
    (instructions, instructionId) =>
      instructions.find(({ id }) => id === instructionId) || null
  );
  readonly instructionArguments$ = this.select(
    this._workspaceStore.instructionArguments$,
    this.instructionId$,
    (instructionArguments, instructionId) =>
      instructionArguments.filter(
        ({ data }) => data.instruction === instructionId
      )
  );
  readonly instructionAccounts$ = this.select(
    this._workspaceStore.instructionAccounts$,
    this.instructionId$,
    (instructionAccounts, instructionId) =>
      instructionAccounts.filter(
        ({ data }) => data.instruction === instructionId
      )
  );
  readonly instructionRelations$ = this.select(
    this._workspaceStore.instructionRelations$,
    this.instructionId$,
    (instructionRelations, instructionId) =>
      instructionRelations.filter(
        ({ data }) => data.instruction === instructionId
      )
  );
  readonly instructionBody$ = this.select(
    this.instruction$,
    (instruction) => instruction && instruction.data.body
  );
  readonly instructionContext$ = this.select(
    this.instruction$,
    this.instructionArguments$,
    this.instructionAccounts$,
    this.instructionRelations$,
    (
      instruction,
      instructionArguments,
      instructionAccounts,
      instructionRelations
    ) =>
      instruction &&
      generateInstructionCode(
        instruction,
        instructionArguments,
        instructionAccounts,
        instructionRelations
      )
  );

  constructor(
    private readonly _matDialog: MatDialog,
    private readonly _bulldozerProgramStore: BulldozerProgramStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _applicationStore: ApplicationStore
  ) {
    super(initialState);
  }

  readonly selectInstruction = this.effect(
    (instructionId$: Observable<string | null>) =>
      instructionId$.pipe(
        tap((instructionId) => this.patchState({ instructionId }))
      )
  );

  readonly createInstruction = this.effect((action$) =>
    action$.pipe(
      exhaustMap(() =>
        this._matDialog
          .open(EditInstructionComponent)
          .afterClosed()
          .pipe(
            filter((data) => data),
            withLatestFrom(
              this._workspaceStore.workspaceId$.pipe(isNotNullOrUndefined),
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(([{ name }, workspaceId, applicationId]) =>
              this._bulldozerProgramStore.createInstruction(
                workspaceId,
                applicationId,
                name
              )
            ),
            tapResponse(
              () => this._events.next(new InstructionCreated()),
              (error) => this._error.next(error)
            )
          )
      )
    )
  );

  readonly updateInstruction = this.effect(
    (instruction$: Observable<Document<Instruction>>) =>
      instruction$.pipe(
        exhaustMap((instruction) =>
          this._matDialog
            .open(EditInstructionComponent, { data: { instruction } })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name }) =>
                this._bulldozerProgramStore.updateInstruction(
                  instruction.id,
                  name
                )
              ),
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
        concatMap((instruction) => {
          const instructionData = this._workspaceStore.getInstructionData(
            instruction.id
          );

          return this._bulldozerProgramStore
            .deleteInstruction(
              instruction.id,
              instructionData.instructionArguments.map(({ id }) => id),
              instructionData.instructionAccounts.map(({ id }) => id),
              instructionData.instructionRelations.map(({ id }) => id)
            )
            .pipe(
              tapResponse(
                () => this._events.next(new InstructionDeleted(instruction.id)),
                (error) => this._error.next(error)
              )
            );
        })
      )
  );
}
