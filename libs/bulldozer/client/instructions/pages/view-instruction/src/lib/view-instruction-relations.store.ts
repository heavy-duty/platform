import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/core-data-access';
import {
  InstructionRelationApiService,
  InstructionRelationEventService,
} from '@bulldozer-client/instructions-data-access';
import {
  Document,
  Instruction,
  InstructionRelation,
  Relation,
} from '@heavy-duty/bulldozer-devkit';
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
import { ViewInstructionRouteStore } from './view-instruction-route.store';

interface ViewModel {
  loading: boolean;
  instructionRelationsMap: Map<string, Relation<InstructionRelation>>;
}

const initialState: ViewModel = {
  loading: false,
  instructionRelationsMap: new Map<string, Relation<InstructionRelation>>(),
};

@Injectable()
export class ViewInstructionRelationsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
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

  constructor(
    private readonly _instructionRelationApiService: InstructionRelationApiService,
    private readonly _instructionRelationEventService: InstructionRelationEventService,
    private readonly _viewInstructionRouteStore: ViewInstructionRouteStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _walletStore: WalletStore
  ) {
    super(initialState);
  }

  private readonly _setInstructionRelation = this.updater(
    (state, newInstructionRelation: Relation<InstructionRelation>) => {
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
    (state, newInstructionRelation: Relation<InstructionRelation>) => {
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

  private readonly _handleInstructionRelationChanges = this.effect(
    (instructionRelationId$: Observable<string>) =>
      instructionRelationId$.pipe(
        mergeMap((instructionRelationId) =>
          this._instructionRelationEventService
            .instructionRelationChanges(instructionRelationId)
            .pipe(
              tapResponse(
                (changes) => {
                  if (changes === null) {
                    this._removeInstructionRelation(instructionRelationId);
                  } else {
                    this._setInstructionRelation(changes);
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

  protected readonly handleInstructionRelationCreated = this.effect(() =>
    this._viewInstructionRouteStore.instructionId$.pipe(
      switchMap((instructionId) => {
        if (instructionId === null) {
          return EMPTY;
        }

        return this._instructionRelationEventService
          .instructionRelationCreated({
            instruction: instructionId,
          })
          .pipe(
            tapResponse(
              (instructionRelation) => {
                this._addInstructionRelation(instructionRelation);
                this._handleInstructionRelationChanges(instructionRelation.id);
              },
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );

  protected readonly loadInstructionRelations = this.effect(() =>
    this._viewInstructionRouteStore.instructionId$.pipe(
      tap(() => this.patchState({ loading: true })),
      switchMap((instructionId) => {
        if (instructionId === null) {
          return EMPTY;
        }

        return this._instructionRelationApiService
          .find({
            instruction: instructionId,
          })
          .pipe(
            tapResponse(
              (instructionRelations) => {
                this.patchState({
                  instructionRelationsMap: instructionRelations.reduce(
                    (instructionRelationsMap, instructionRelation) =>
                      instructionRelationsMap.set(
                        instructionRelation.id,
                        instructionRelation
                      ),
                    new Map<string, Relation<InstructionRelation>>()
                  ),
                  loading: false,
                });
                instructionRelations.forEach(({ id }) =>
                  this._handleInstructionRelationChanges(id)
                );
              },
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );

  readonly createInstructionRelation = this.effect(
    (
      $: Observable<{
        fromAccountId: string;
        toAccountId: string;
        instruction: Document<Instruction>;
      }>
    ) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
        ),
        concatMap(
          ([{ fromAccountId, toAccountId, instruction }, authority]) => {
            if (instruction === null || authority === null) {
              return EMPTY;
            }

            return this._instructionRelationApiService
              .create({
                fromAccountId,
                toAccountId,
                authority: authority.toBase58(),
                workspaceId: instruction.data.workspace,
                applicationId: instruction.data.application,
                instructionId: instruction.id,
              })
              .pipe(
                tapResponse(
                  () =>
                    this._notificationStore.setEvent(
                      'Create relation request sent'
                    ),
                  (error) => this._notificationStore.setError(error)
                )
              );
          }
        )
      )
  );

  readonly deleteInstructionRelation = this.effect(
    (
      $: Observable<{
        fromAccountId: string;
        toAccountId: string;
      }>
    ) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
        ),
        concatMap(([{ fromAccountId, toAccountId }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionRelationApiService
            .delete({
              authority: authority.toBase58(),
              fromAccountId,
              toAccountId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Delete relation request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        })
      )
  );
}
