import { Injectable } from '@angular/core';
import { ApplicationApiService } from '@bulldozer-client/applications-data-access';
import {
  CollectionApiService,
  CollectionAttributeApiService,
} from '@bulldozer-client/collections-data-access';
import { ConfigStore } from '@bulldozer-client/core-data-access';
import {
  InstructionAccountApiService,
  InstructionApiService,
  InstructionArgumentApiService,
  InstructionRelationApiService,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  WorkspaceApiService,
  WorkspacesStore,
} from '@bulldozer-client/workspaces-data-access';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import {
  generateWorkspaceMetadata,
  generateWorkspaceZip,
} from '@heavy-duty/generator';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, forkJoin, of, pipe, withLatestFrom } from 'rxjs';

interface ViewModel {
  workspace: Document<Workspace> | null;
}

const initialState: ViewModel = {
  workspace: null,
};

@Injectable()
export class WorkspaceSelectorStore extends ComponentStore<ViewModel> {
  readonly workspace$ = this.select(({ workspace }) => workspace);

  constructor(
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _applicationApiService: ApplicationApiService,
    private readonly _collectionApiService: CollectionApiService,
    private readonly _collectionAttributeApiService: CollectionAttributeApiService,
    private readonly _instructionApiService: InstructionApiService,
    private readonly _instructionArgumentApiService: InstructionArgumentApiService,
    private readonly _instructionAccountApiService: InstructionAccountApiService,
    private readonly _instructionRelationApiService: InstructionRelationApiService,
    private readonly _notificationStore: NotificationStore,
    private readonly _walletStore: WalletStore,
    workspacesStore: WorkspacesStore,
    configStore: ConfigStore
  ) {
    super(initialState);

    this._loadWorkspace(
      this.select(
        configStore.workspaceId$,
        workspacesStore.workspaces$,
        (workspaceId, workspaces) => ({
          workspaceId,
          workspaces,
        }),
        { debounce: true }
      )
    );
  }

  private readonly _loadWorkspace = this.updater<{
    workspaceId: string | null;
    workspaces: Document<Workspace>[];
  }>((state, { workspaceId, workspaces }) => ({
    ...state,
    workspace:
      workspaces.find((workspace) => workspace?.id === workspaceId) ?? null,
  }));

  readonly downloadWorkspace = this.effect<string>(
    concatMap((workspaceId) =>
      forkJoin({
        workspace: this._workspaceApiService.findById(workspaceId),
        applications: this._applicationApiService.find({
          workspace: workspaceId,
        }),
        collections: this._collectionApiService.find({
          workspace: workspaceId,
        }),
        collectionAttributes: this._collectionAttributeApiService.find({
          workspace: workspaceId,
        }),
        instructions: this._instructionApiService.find({
          workspace: workspaceId,
        }),
        instructionArguments: this._instructionArgumentApiService.find({
          workspace: workspaceId,
        }),
        instructionAccounts: this._instructionAccountApiService.find({
          workspace: workspaceId,
        }),
        instructionRelations: this._instructionRelationApiService.find({
          workspace: workspaceId,
        }),
      }).pipe(
        tapResponse(
          ({
            workspace,
            applications,
            collections,
            collectionAttributes,
            instructions,
            instructionArguments,
            instructionAccounts,
            instructionRelations,
          }) =>
            workspace &&
            generateWorkspaceZip(
              workspace,
              generateWorkspaceMetadata(
                applications,
                collections,
                collectionAttributes,
                instructions,
                instructionArguments,
                instructionAccounts,
                instructionRelations
              )
            ),
          (error) => this._notificationStore.setError(error)
        )
      )
    )
  );

  readonly createWorkspace = this.effect<string>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([workspaceName, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._workspaceApiService
          .create({
            workspaceName,
            authority: authority.toBase58(),
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Create workspace request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );

  readonly updateWorkspace = this.effect<{
    workspaceId: string;
    workspaceName: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ workspaceId, workspaceName }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._workspaceApiService
          .update({
            workspaceName,
            authority: authority.toBase58(),
            workspaceId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Update workspace request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );

  readonly deleteWorkspace = this.effect<string>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([workspaceId, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._workspaceApiService
          .delete({
            authority: authority.toBase58(),
            workspaceId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Delete workspace request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );
}
