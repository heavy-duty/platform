import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  Document,
  InstructionArgument,
  InstructionArgumentFilters,
} from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, from, mergeMap, Observable, switchMap } from 'rxjs';
import { InstructionArgumentApiService } from './instruction-argument-api.service';
import { InstructionArgumentEventService } from './instruction-argument-event.service';
import { ItemView } from './types';

export type InstructionArgumentItemView = ItemView<
  Document<InstructionArgument>
>;

interface ItemStatus {
  isUpdating: number;
  isDeleting: number;
}

interface ViewModel {
  loading: boolean;
  filters: InstructionArgumentFilters | null;
  creatingInstructionArgumentsMap: Map<string, Document<InstructionArgument>>;
  instructionArgumentIds: string[] | null;
  instructionArgumentsMap: Map<string, Document<InstructionArgument>>;
  instructionArgumentStatusesMap: Map<string, ItemStatus>;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  creatingInstructionArgumentsMap: new Map<
    string,
    Document<InstructionArgument>
  >(),
  instructionArgumentIds: null,
  instructionArgumentsMap: new Map<string, Document<InstructionArgument>>(),
  instructionArgumentStatusesMap: new Map<string, ItemStatus>(),
};

@Injectable()
export class InstructionArgumentsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly creatingInstructionArgumentsMap$ = this.select(
    ({ creatingInstructionArgumentsMap }) => creatingInstructionArgumentsMap
  );
  readonly instructionArgumentIds$ = this.select(
    ({ instructionArgumentIds }) => instructionArgumentIds
  );
  readonly instructionArgumentsMap$ = this.select(
    ({ instructionArgumentsMap }) => instructionArgumentsMap
  );
  readonly instructionArgumentStatusesMap$ = this.select(
    ({ instructionArgumentStatusesMap }) => instructionArgumentStatusesMap
  );
  readonly instructionArguments$: Observable<InstructionArgumentItemView[]> =
    this.select(
      this.instructionArgumentsMap$,
      this.creatingInstructionArgumentsMap$,
      this.instructionArgumentStatusesMap$,
      (
        instructionArgumentsMap,
        creatingInstructionArgumentsMap,
        instructionArgumentStatusesMap
      ) => {
        return [
          ...Array.from(
            instructionArgumentsMap,
            ([instructionArgumentId, instructionArgument]) => {
              const itemStatus = instructionArgumentStatusesMap.get(
                instructionArgumentId
              );

              return {
                document: instructionArgument,
                ...{
                  isCreating: false,
                  isUpdating: (itemStatus?.isUpdating ?? 0) > 0,
                  isDeleting: (itemStatus?.isDeleting ?? 0) > 0,
                },
              };
            }
          ),
          ...Array.from(
            creatingInstructionArgumentsMap,
            ([, instructionArgument]) => {
              return {
                document: instructionArgument,
                ...{
                  isCreating: true,
                  isUpdating: false,
                  isDeleting: false,
                },
              };
            }
          ),
        ].sort((a, b) =>
          b.document.createdAt.lt(a.document.createdAt) ? 1 : -1
        );
      }
    );

  constructor(
    private readonly _instructionArgumentApiService: InstructionArgumentApiService,
    private readonly _notificationStore: NotificationStore,
    private readonly _instructionArgumentEventService: InstructionArgumentEventService
  ) {
    super(initialState);

    this._loadInstructionArguments(this.instructionArgumentIds$);
    this._loadInstructionArgumentIds(this.filters$);
    this._handleArgumentCreates(this.filters$);
    this._handleArgumentUpdates(this.instructionArgumentIds$);
    this._handleArgumentDeletes(this.instructionArgumentIds$);
  }

  private readonly _addCreatingInstructionArgument = this.updater<
    Document<InstructionArgument>
  >((state, newInstructionArgument) => {
    const creatingInstructionArgumentsMap = new Map(
      state.creatingInstructionArgumentsMap
    );
    creatingInstructionArgumentsMap.set(
      newInstructionArgument.id,
      newInstructionArgument
    );
    return {
      ...state,
      creatingInstructionArgumentsMap,
    };
  });

  private readonly _addInstructionArgumentId = this.updater<string>(
    (state, instructionArgumentId) => {
      return {
        ...state,
        instructionArgumentIds: [
          ...(state.instructionArgumentIds ?? []),
          instructionArgumentId,
        ],
      };
    }
  );

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

  private readonly _setInstructionArgumentsMap = this.updater<
    Map<string, Document<InstructionArgument>>
  >((state, newInstructionArgumentsMap) => {
    const instructionArgumentsMap = new Map(state.instructionArgumentsMap);
    const creatingInstructionArgumentsMap = new Map(
      state.creatingInstructionArgumentsMap
    );

    newInstructionArgumentsMap.forEach((newInstructionArgument) => {
      instructionArgumentsMap.set(
        newInstructionArgument.id,
        newInstructionArgument
      );
      creatingInstructionArgumentsMap.delete(newInstructionArgument.id);
    });

    return {
      ...state,
      instructionArgumentsMap,
      creatingInstructionArgumentsMap,
    };
  });

  private readonly _markAsUpdating = this.updater<{
    instructionArgumentId: string;
    isUpdating: boolean;
  }>((state, { instructionArgumentId, isUpdating }) => {
    const instructionArgumentStatusesMap = new Map(
      state.instructionArgumentStatusesMap
    );
    const instructionArgumentStatus = instructionArgumentStatusesMap.get(
      instructionArgumentId
    );

    return {
      ...state,
      instructionArgumentStatusesMap: instructionArgumentStatusesMap.set(
        instructionArgumentId,
        {
          isUpdating:
            (instructionArgumentStatus?.isUpdating ?? 0) +
            (isUpdating ? 1 : -1),
          isDeleting: instructionArgumentStatus?.isDeleting ?? 0,
        }
      ),
    };
  });

  private readonly _resetUpdatingStatus = this.updater<string>(
    (state, instructionArgumentId) => {
      const instructionArgumentStatusesMap = new Map(
        state.instructionArgumentStatusesMap
      );
      const instructionArgumentStatus = instructionArgumentStatusesMap.get(
        instructionArgumentId
      );

      return {
        ...state,
        instructionArgumentStatusesMap: instructionArgumentStatusesMap.set(
          instructionArgumentId,
          {
            isUpdating: 0,
            isDeleting: instructionArgumentStatus?.isDeleting ?? 0,
          }
        ),
      };
    }
  );

  private readonly _markAsDeleting = this.updater<{
    instructionArgumentId: string;
    isDeleting: boolean;
  }>((state, { instructionArgumentId, isDeleting }) => {
    const instructionArgumentStatusesMap = new Map(
      state.instructionArgumentStatusesMap
    );
    const instructionArgumentStatus = instructionArgumentStatusesMap.get(
      instructionArgumentId
    );

    return {
      ...state,
      instructionArgumentStatusesMap: instructionArgumentStatusesMap.set(
        instructionArgumentId,
        {
          isUpdating: instructionArgumentStatus?.isUpdating ?? 0,
          isDeleting:
            (instructionArgumentStatus?.isDeleting ?? 0) +
            (isDeleting ? 1 : -1),
        }
      ),
    };
  });

  private readonly _removeInstructionArgument = this.updater<string>(
    (state, instructionArgumentIdToRemove) => {
      const instructionArgumentsMap = new Map(state.instructionArgumentsMap);
      instructionArgumentsMap.delete(instructionArgumentIdToRemove);
      return {
        ...state,
        instructionArgumentsMap,
        instructionArgumentIds:
          state.instructionArgumentIds?.filter(
            (instructionArgumentId) =>
              instructionArgumentId !== instructionArgumentIdToRemove
          ) ?? [],
      };
    }
  );

  readonly setFilters = this.updater<InstructionArgumentFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );

  private readonly _handleArgumentCreates =
    this.effect<InstructionArgumentFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        return this._instructionArgumentEventService
          .documentCreated(filters)
          .pipe(
            tapResponse(
              (event) => {
                if (event.status === 'confirmed') {
                  this._addCreatingInstructionArgument(event.data);
                } else {
                  this._addInstructionArgumentId(event.data);
                }
              },
              (error) => this._notificationStore.setError({ error })
            )
          );
      })
    );

  private readonly _handleArgumentUpdates = this.effect<string[] | null>(
    switchMap((instructionArgumentIds) => {
      if (instructionArgumentIds === null) {
        return EMPTY;
      }

      return from(instructionArgumentIds).pipe(
        isNotNullOrUndefined,
        mergeMap((instructionArgumentId) => {
          this._resetUpdatingStatus(instructionArgumentId);

          return this._instructionArgumentEventService
            .documentUpdated(instructionArgumentId)
            .pipe(
              tapResponse(
                (event) => {
                  this._markAsUpdating({
                    instructionArgumentId,
                    isUpdating: event.status === 'confirmed',
                  });

                  if (event.data !== undefined) {
                    this._setInstructionArgument(event.data);
                  }
                },
                (error) => this._notificationStore.setError({ error })
              )
            );
        })
      );
    })
  );

  private readonly _handleArgumentDeletes = this.effect<string[] | null>(
    switchMap((instructionArgumentIds) => {
      if (instructionArgumentIds === null) {
        return EMPTY;
      }

      return from(instructionArgumentIds).pipe(
        isNotNullOrUndefined,
        mergeMap((instructionArgumentId) =>
          this._instructionArgumentEventService
            .documentDeleted(instructionArgumentId)
            .pipe(
              tapResponse(
                (status) => {
                  this._markAsDeleting({
                    instructionArgumentId,
                    isDeleting: status === 'confirmed',
                  });

                  if (status === 'finalized') {
                    this._removeInstructionArgument(instructionArgumentId);
                  }
                },
                (error) => this._notificationStore.setError({ error })
              )
            )
        )
      );
    })
  );

  private readonly _loadInstructionArgumentIds =
    this.effect<InstructionArgumentFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        return this._instructionArgumentApiService.findIds(filters).pipe(
          tapResponse(
            (instructionArgumentIds) => {
              this.patchState({
                instructionArgumentIds,
              });
            },
            (error) => this._notificationStore.setError(error)
          )
        );
      })
    );

  private readonly _loadInstructionArguments = this.effect<string[] | null>(
    switchMap((instructionArgumentIds) => {
      if (instructionArgumentIds === null) {
        return EMPTY;
      }

      if (instructionArgumentIds.length === 0) {
        this.patchState({
          instructionArgumentsMap: new Map<
            string,
            Document<InstructionArgument>
          >(),
          creatingInstructionArgumentsMap: new Map<
            string,
            Document<InstructionArgument>
          >(),
          instructionArgumentStatusesMap: new Map<string, ItemStatus>(),
        });

        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._instructionArgumentApiService
        .findByIds(instructionArgumentIds)
        .pipe(
          tapResponse(
            (instructionArguments) => {
              this._setInstructionArgumentsMap(
                instructionArguments
                  .filter(
                    (
                      instructionArgument
                    ): instructionArgument is Document<InstructionArgument> =>
                      instructionArgument !== null
                  )
                  .reduce(
                    (instructionArgumentsMap, instructionArgument) =>
                      instructionArgumentsMap.set(
                        instructionArgument.id,
                        instructionArgument
                      ),
                    new Map<string, Document<InstructionArgument>>()
                  )
              );

              this.patchState({
                loading: false,
              });
            },
            (error) => this._notificationStore.setError({ error })
          )
        );
    })
  );
}
