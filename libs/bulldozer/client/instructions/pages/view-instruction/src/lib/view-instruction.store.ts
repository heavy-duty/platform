import { Injectable } from '@angular/core';
import {
  CollectionQueryStore,
  CollectionsStore,
} from '@bulldozer-client/collections-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import {
  InstructionApiService,
  InstructionArgumentApiService,
  InstructionArgumentQueryStore,
  InstructionArgumentsStore,
  InstructionStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { InstructionArgumentDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, map, of, pipe, tap, withLatestFrom } from 'rxjs';

interface ViewModel {
  instructionId: string | null;
  applicationId: string | null;
  workspaceId: string | null;
}

const initialState: ViewModel = {
  instructionId: null,
  applicationId: null,
  workspaceId: null,
};

@Injectable()
export class ViewInstructionStore extends ComponentStore<ViewModel> {
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _tabStore: TabStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _instructionApiService: InstructionApiService,
    private readonly _instructionArgumentApiService: InstructionArgumentApiService,
    private readonly _instructionStore: InstructionStore,
    private readonly _collectionsStore: CollectionsStore,
    private readonly _collectionQueryStore: CollectionQueryStore,
    private readonly _instructionArgumentsStore: InstructionArgumentsStore,
    private readonly _instructionArgumentQueryStore: InstructionArgumentQueryStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._instructionStore.setInstructionId(this.instructionId$);
    this._collectionQueryStore.setFilters(
      this.applicationId$.pipe(
        isNotNullOrUndefined,
        map((application) => ({ application }))
      )
    );
    this._collectionsStore.setCollectionIds(
      this._collectionQueryStore.collectionIds$
    );
    this._instructionArgumentQueryStore.setFilters(
      this.instructionId$.pipe(
        isNotNullOrUndefined,
        map((instruction) => ({ instruction }))
      )
    );
    this._instructionArgumentsStore.setInstructionArgumentIds(
      this._instructionArgumentQueryStore.instructionArgumentIds$
    );

    this._handleInstruction(workspaceInstructionsStore.instruction$);
    this._openTab(
      this.select(
        this.instructionId$,
        this.applicationId$,
        this.workspaceId$,
        (instructionId, applicationId, workspaceId) => ({
          instructionId,
          applicationId,
          workspaceId,
        }),
        { debounce: true }
      )
    );
  }

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({ ...state, workspaceId })
  );

  readonly setApplicationId = this.updater<string | null>(
    (state, applicationId) => ({ ...state, applicationId })
  );

  readonly setInstructionId = this.updater<string | null>(
    (state, instructionId) => ({ ...state, instructionId })
  );

  private readonly _handleInstruction = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        case 'createInstruction':
        case 'updateInstruction':
        case 'deleteInstruction': {
          this._instructionStore.dispatch(instructionStatus);
          break;
        }
        case 'createInstructionArgument':
        case 'updateInstructionArgument':
        case 'deleteInstructionArgument': {
          this._instructionArgumentsStore.dispatch(instructionStatus);
          break;
        }
        case 'createCollection':
        case 'updateCollection':
        case 'deleteCollection': {
          this._collectionsStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
  );

  private readonly _openTab = this.effect<{
    instructionId: string | null;
    applicationId: string | null;
    workspaceId: string | null;
  }>(
    tap(({ instructionId, applicationId, workspaceId }) => {
      if (
        instructionId !== null &&
        applicationId !== null &&
        workspaceId !== null
      ) {
        this._tabStore.openTab({
          id: instructionId,
          kind: 'instruction',
          url: `/workspaces/${workspaceId}/applications/${applicationId}/instructions/${instructionId}`,
        });
      }
    })
  );

  readonly updateInstructionBody = this.effect<{
    workspaceId: string;
    applicationId: string;
    instructionId: string;
    instructionBody: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          { workspaceId, applicationId, instructionId, instructionBody },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionApiService
            .updateBody({
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
              instructionId,
              instructionBody,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent('Update body request sent'),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly createInstructionArgument = this.effect<{
    workspaceId: string;
    applicationId: string;
    instructionId: string;
    instructionArgumentDto: InstructionArgumentDto;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          { workspaceId, applicationId, instructionId, instructionArgumentDto },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionArgumentApiService
            .create({
              instructionArgumentDto,
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
              instructionId,
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
        }
      )
    )
  );

  readonly updateInstructionArgument = this.effect<{
    workspaceId: string;
    instructionId: string;
    instructionArgumentId: string;
    instructionArgumentDto: InstructionArgumentDto;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          {
            workspaceId,
            instructionId,
            instructionArgumentId,
            instructionArgumentDto,
          },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionArgumentApiService
            .update({
              authority: authority.toBase58(),
              workspaceId,
              instructionId,
              instructionArgumentDto,
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
    workspaceId: string;
    instructionId: string;
    instructionArgumentId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          { workspaceId, instructionId, instructionArgumentId },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionArgumentApiService
            .delete({
              authority: authority.toBase58(),
              workspaceId,
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
        }
      )
    )
  );
}
