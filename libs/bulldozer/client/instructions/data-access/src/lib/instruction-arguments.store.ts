import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/core-data-access';
import {
  Document,
  Instruction,
  InstructionArgument,
  InstructionArgumentDto,
  InstructionArgumentFilters,
  InstructionFilters,
} from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  filter,
  first,
  mergeMap,
  of,
  pipe,
  switchMap,
  takeUntil,
  takeWhile,
  withLatestFrom,
} from 'rxjs';
import { InstructionArgumentApiService } from './instruction-argument-api.service';
import { InstructionArgumentEventService } from './instruction-argument-event.service';

interface ViewModel {
  loading: boolean;
  filters: InstructionArgumentFilters | null;
  instructionArgumentsMap: Map<string, Document<InstructionArgument>>;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  instructionArgumentsMap: new Map<string, Document<InstructionArgument>>(),
};

@Injectable()
export class InstructionArgumentsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
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
    private readonly _instructionArgumentEventService: InstructionArgumentEventService,
    private readonly _notificationStore: NotificationStore,
    private readonly _walletStore: WalletStore
  ) {
    super(initialState);

    this._loadInstructionArguments(this.filters$);
    this._handleInstructionArgumentCreated(this.filters$);
  }

  private readonly _setInstructionArgument = this.updater<
    Document<InstructionArgument>
  >((state, newInstructionArgument) => {
    const instructionArgumentsMap = new Map(state.instructionArgumentsMap);
    instructionArgumentsMap.set(
      newInstructionArgument.id,
      newInstructionArgument
    );
    return {
      ...state,
      instructionArgumentsMap,
    };
  });

  private readonly _addInstructionArgument = this.updater<
    Document<InstructionArgument>
  >((state, newInstructionArgument) => {
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
  });

  private readonly _removeInstructionArgument = this.updater<string>(
    (state, instructionArgumentId) => {
      const instructionArgumentsMap = new Map(state.instructionArgumentsMap);
      instructionArgumentsMap.delete(instructionArgumentId);
      return {
        ...state,
        instructionArgumentsMap,
      };
    }
  );

  private readonly _handleInstructionArgumentChanges = this.effect<string>(
    mergeMap((instructionArgumentId) =>
      this._instructionArgumentEventService
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
  );

  private readonly _handleInstructionArgumentCreated =
    this.effect<InstructionArgumentFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        return this._instructionArgumentEventService
          .instructionArgumentCreated(filters)
          .pipe(
            tapResponse(
              (instructionArgument) => {
                this._addInstructionArgument(instructionArgument);
                this._handleInstructionArgumentChanges(instructionArgument.id);
              },
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    );

  private readonly _loadInstructionArguments =
    this.effect<InstructionFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        this.patchState({ loading: true });

        return this._instructionArgumentApiService.find(filters).pipe(
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
        );
      })
    );

  readonly setFilters = this.updater<InstructionArgumentFilters>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );

  readonly createInstructionArgument = this.effect<{
    instruction: Document<Instruction>;
    instructionArgumentDto: InstructionArgumentDto;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ instruction, instructionArgumentDto }, authority]) => {
        if (instruction === null || authority === null) {
          return EMPTY;
        }

        return this._instructionArgumentApiService
          .create({
            instructionArgumentDto,
            authority: authority.toBase58(),
            workspaceId: instruction.data.workspace,
            applicationId: instruction.data.application,
            instructionId: instruction.id,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Create argument request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );

  readonly updateInstructionArgument = this.effect<{
    instructionArgumentId: string;
    instructionArgumentDto: InstructionArgumentDto;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([{ instructionArgumentId, instructionArgumentDto }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionArgumentApiService
            .update({
              instructionArgumentDto,
              authority: authority.toBase58(),
              instructionArgumentId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Update argument request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly deleteInstructionArgument = this.effect<{
    instructionId: string;
    instructionArgumentId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ instructionId, instructionArgumentId }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._instructionArgumentApiService
          .delete({
            authority: authority.toBase58(),
            instructionArgumentId,
            instructionId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Delete argument request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );
}
