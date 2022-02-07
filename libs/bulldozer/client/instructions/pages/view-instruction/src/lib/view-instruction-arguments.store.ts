import { Injectable } from '@angular/core';
import {
  InstructionArgumentApiService,
  InstructionArgumentSocketService,
} from '@bulldozer-client/instructions-data-access';
import {
  Document,
  InstructionArgument,
  InstructionArgumentDto,
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
  instructionArgumentsMap: Map<string, Document<InstructionArgument>>;
  error: unknown | null;
}

const initialState: ViewModel = {
  loading: false,
  instructionArgumentsMap: new Map<string, Document<InstructionArgument>>(),
  error: null,
};

@Injectable()
export class ViewInstructionArgumentsStore extends ComponentStore<ViewModel> {
  readonly error$ = this.select(({ error }) => error);
  readonly loading$ = this.select(({ loading }) => loading);
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

  constructor(
    private readonly _instructionArgumentApiService: InstructionArgumentApiService,
    private readonly _instructionArgumentSocketService: InstructionArgumentSocketService,
    private readonly _viewInstructionRouteStore: ViewInstructionRouteStore,
    private readonly _walletStore: WalletStore
  ) {
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

  private readonly _setError = this.updater((state, error: unknown) => ({
    ...state,
    error,
  }));

  private readonly _handleInstructionArgumentChanges = this.effect(
    (instructionArgumentId$: Observable<string>) =>
      instructionArgumentId$.pipe(
        mergeMap((instructionArgumentId) =>
          this._instructionArgumentSocketService
            .instructionArgumentChanges(instructionArgumentId)
            .pipe(
              tapResponse(
                (changes) => {
                  if (changes === null) {
                    this._removeInstructionArgument(instructionArgumentId);
                  } else {
                    this._setInstructionArgument(changes);
                  }
                },
                (error) => this._setError(error)
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

  protected readonly handleInstructionArgumentCreated = this.effect(() =>
    this._viewInstructionRouteStore.instructionId$.pipe(
      switchMap((instructionId) => {
        if (instructionId === null) {
          return of(null);
        }

        return this._instructionArgumentSocketService
          .instructionArgumentCreated({
            instruction: instructionId,
          })
          .pipe(
            tapResponse(
              (instructionArgument) => {
                this._addInstructionArgument(instructionArgument);
                this._handleInstructionArgumentChanges(instructionArgument.id);
              },
              (error) => this._setError(error)
            )
          );
      })
    )
  );

  protected readonly loadInstructionArguments = this.effect(() =>
    this._viewInstructionRouteStore.instructionId$.pipe(
      tap(() => this.patchState({ loading: true })),
      switchMap((instructionId) => {
        if (instructionId === null) {
          return of([]);
        }

        return this._instructionArgumentApiService.find({
          instruction: instructionId,
        });
      }),
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
            loading: false,
          });
          instructionArguments.forEach(({ id }) =>
            this._handleInstructionArgumentChanges(id)
          );
        },
        (error) => this._setError(error)
      )
    )
  );

  readonly createInstructionArgument = this.effect(
    (
      $: Observable<{
        instructionArgumentDto: InstructionArgumentDto;
      }>
    ) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(
            withLatestFrom(
              this._viewInstructionRouteStore.workspaceId$,
              this._viewInstructionRouteStore.applicationId$,
              this._viewInstructionRouteStore.instructionId$,
              this._walletStore.publicKey$
            )
          )
        ),
        concatMap(
          ([
            { instructionArgumentDto },
            workspaceId,
            applicationId,
            instructionId,
            authority,
          ]) => {
            if (
              workspaceId === null ||
              applicationId === null ||
              instructionId === null ||
              authority === null
            ) {
              return EMPTY;
            }

            return this._instructionArgumentApiService.create({
              instructionArgumentDto,
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
              instructionId,
            });
          }
        )
      )
  );

  readonly updateInstructionArgument = this.effect(
    (
      $: Observable<{
        instructionArgumentId: string;
        instructionArgumentDto: InstructionArgumentDto;
      }>
    ) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
        ),
        concatMap(
          ([{ instructionArgumentId, instructionArgumentDto }, authority]) => {
            if (authority === null) {
              return EMPTY;
            }

            return this._instructionArgumentApiService.update({
              instructionArgumentDto,
              authority: authority?.toBase58(),
              instructionArgumentId,
            });
          }
        )
      )
  );

  readonly deleteInstructionArgument = this.effect(
    ($: Observable<{ instructionArgumentId: string }>) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(
            withLatestFrom(
              this._viewInstructionRouteStore.instructionId$,
              this._walletStore.publicKey$
            )
          )
        ),
        concatMap(([{ instructionArgumentId }, instructionId, authority]) => {
          if (instructionId === null || authority === null) {
            return EMPTY;
          }

          return this._instructionArgumentApiService.delete({
            authority: authority.toBase58(),
            instructionArgumentId,
            instructionId,
          });
        })
      )
  );
}
