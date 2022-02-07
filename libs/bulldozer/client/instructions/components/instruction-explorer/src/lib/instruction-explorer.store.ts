import { Injectable } from '@angular/core';
import {
  InstructionApiService,
  InstructionSocketService,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notification-store';
import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  filter,
  first,
  mergeMap,
  Observable,
  of,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
  withLatestFrom,
} from 'rxjs';

interface ViewModel {
  loading: boolean;
  workspaceId: string | null;
  applicationId: string | null;
  instructionsMap: Map<string, Document<Instruction>>;
}

const initialState: ViewModel = {
  loading: false,
  workspaceId: null,
  applicationId: null,
  instructionsMap: new Map<string, Document<Instruction>>(),
};

@Injectable()
export class InstructionExplorerStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly instructionsMap$ = this.select(
    ({ instructionsMap }) => instructionsMap
  );
  readonly instructions$ = this.select(
    this.instructionsMap$,
    (instructionsMap) =>
      Array.from(instructionsMap, ([, instruction]) => instruction)
  );

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _instructionApiService: InstructionApiService,
    private readonly _instructionSocketService: InstructionSocketService,
    private readonly _notificationStore: NotificationStore
  ) {
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

  readonly setApplicationId = this.updater(
    (state, applicationId: string | null) => ({ ...state, applicationId })
  );

  readonly setWorkspaceId = this.updater(
    (state, workspaceId: string | null) => ({ ...state, workspaceId })
  );

  private readonly _handleInstructionChanges = this.effect(
    (instructionId$: Observable<string>) =>
      instructionId$.pipe(
        mergeMap((instructionId) =>
          this._instructionSocketService.instructionChanges(instructionId).pipe(
            tapResponse(
              (changes) => {
                if (changes === null) {
                  this._removeInstruction(instructionId);
                } else {
                  this._setInstruction(changes);
                }
              },
              (error) => this._notificationStore.setError(error)
            ),
            takeUntil(
              this.loading$.pipe(
                filter((loading) => loading),
                first()
              )
            ),
            takeWhile((instruction) => instruction !== null)
          )
        )
      )
  );

  protected readonly handleInstructionCreated = this.effect(() =>
    this.applicationId$.pipe(
      switchMap((applicationId) => {
        if (applicationId === null) {
          return EMPTY;
        }

        return this._instructionSocketService.instructionCreated({
          application: applicationId,
        });
      }),
      tapResponse(
        (instruction) => {
          this._addInstruction(instruction);
          this._handleInstructionChanges(instruction.id);
        },
        (error) => this._notificationStore.setError(error)
      )
    )
  );

  protected readonly loadInstructions = this.effect(() =>
    this.applicationId$.pipe(
      tap(() => this.patchState({ loading: true })),
      switchMap((applicationId) => {
        if (applicationId === null) {
          return of([]);
        }

        return this._instructionApiService.find({ application: applicationId });
      }),
      tapResponse(
        (instructions) => {
          this.patchState({
            instructionsMap: instructions.reduce(
              (instructionsMap, instruction) =>
                instructionsMap.set(instruction.id, instruction),
              new Map<string, Document<Instruction>>()
            ),
            loading: false,
          });
          instructions.forEach(({ id }) => this._handleInstructionChanges(id));
        },
        (error) => this._notificationStore.setError(error)
      )
    )
  );

  readonly createInstruction = this.effect(
    ($: Observable<{ instructionName: string }>) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(
            withLatestFrom(
              this.workspaceId$,
              this.applicationId$,
              this._walletStore.publicKey$
            )
          )
        ),
        concatMap(
          ([{ instructionName }, workspaceId, applicationId, authority]) => {
            if (
              workspaceId === null ||
              applicationId === null ||
              authority === null
            ) {
              return EMPTY;
            }

            return this._instructionApiService.create({
              instructionName,
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
            });
          }
        ),
        tapResponse(
          () =>
            this._notificationStore.setEvent('Create instruction request sent'),
          (error) => this._notificationStore.setError(error)
        )
      )
  );

  readonly updateInstruction = this.effect(
    (
      $: Observable<{
        instructionId: string;
        instructionName: string;
      }>
    ) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
        ),
        concatMap(([{ instructionId, instructionName }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionApiService.update({
            instructionName,
            authority: authority?.toBase58(),
            instructionId,
          });
        }),
        tapResponse(
          () =>
            this._notificationStore.setEvent('Update instruction request sent'),
          (error) => this._notificationStore.setError(error)
        )
      )
  );

  readonly deleteInstruction = this.effect(
    ($: Observable<{ instructionId: string }>) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(
            withLatestFrom(this.applicationId$, this._walletStore.publicKey$)
          )
        ),
        concatMap(([{ instructionId }, applicationId, authority]) => {
          if (applicationId === null || authority === null) {
            return EMPTY;
          }

          return this._instructionApiService.delete({
            authority: authority.toBase58(),
            instructionId,
            applicationId,
          });
        }),
        tapResponse(
          () =>
            this._notificationStore.setEvent('Delete instruction request sent'),
          (error) => this._notificationStore.setError(error)
        )
      )
  );
}
