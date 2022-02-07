import { Injectable } from '@angular/core';
import {
  InstructionArgumentApiService,
  InstructionArgumentSocketService,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notification-store';
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
}

const initialState: ViewModel = {
  loading: false,
  instructionArgumentsMap: new Map<string, Document<InstructionArgument>>(),
};

@Injectable()
export class ViewInstructionArgumentsStore extends ComponentStore<ViewModel> {
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
    private readonly _notificationStore: NotificationStore,
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

  protected readonly handleInstructionArgumentCreated = this.effect(() =>
    this._viewInstructionRouteStore.instructionId$.pipe(
      switchMap((instructionId) => {
        if (instructionId === null) {
          return EMPTY;
        }

        return this._instructionArgumentSocketService.instructionArgumentCreated(
          {
            instruction: instructionId,
          }
        );
      }),
      tapResponse(
        (instructionArgument) => {
          this._addInstructionArgument(instructionArgument);
          this._handleInstructionArgumentChanges(instructionArgument.id);
        },
        (error) => this._notificationStore.setError(error)
      )
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
        (error) => this._notificationStore.setError(error)
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
        ),
        tapResponse(
          () =>
            this._notificationStore.setEvent('Create argument request sent'),
          (error) => this._notificationStore.setError(error)
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
              authority: authority.toBase58(),
              instructionArgumentId,
            });
          }
        ),
        tapResponse(
          () =>
            this._notificationStore.setEvent('Update argument request sent'),
          (error) => this._notificationStore.setError(error)
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
        }),
        tapResponse(
          () =>
            this._notificationStore.setEvent('Delete argument request sent'),
          (error) => this._notificationStore.setError(error)
        )
      )
  );
}
