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
import { UserInstructionsStore } from '@bulldozer-client/users-data-access';
import {
  WorkspaceApiService,
  WorkspaceInstructionsStore,
  WorkspaceStore,
} from '@bulldozer-client/workspaces-data-access';
import {
  generateWorkspaceMetadata,
  generateWorkspaceZip,
} from '@heavy-duty/generator';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  filter,
  forkJoin,
  from,
  merge,
  of,
  pipe,
  switchMap,
  take,
  tap,
  toArray,
  withLatestFrom,
} from 'rxjs';

@Injectable()
export class WorkspaceSelectorStore extends ComponentStore<object> {
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
    private readonly _workspaceInstructionsStore: WorkspaceInstructionsStore,
    private readonly _userInstructionsStore: UserInstructionsStore,
    private readonly _workspaceStore: WorkspaceStore,
    configStore: ConfigStore
  ) {
    super({});

    this._workspaceStore.setWorkspaceId(configStore.workspaceId$);
    this._watchWorkspace(this._workspaceStore.workspaceId$);
  }

  private readonly _watchWorkspace = this.effect<string | null>(
    switchMap((workspaceId) =>
      merge(
        this._workspaceInstructionsStore.instructionStatuses$.pipe(
          take(1),
          concatMap((instructionStatuses) => from(instructionStatuses))
        ),
        this._workspaceInstructionsStore.lastInstructionStatus$.pipe(
          isNotNullOrUndefined
        ),
        this._userInstructionsStore.instructionStatuses$.pipe(
          take(1),
          concatMap((instructionStatuses) => from(instructionStatuses))
        ),
        this._userInstructionsStore.lastInstructionStatus$.pipe(
          isNotNullOrUndefined
        )
      ).pipe(
        filter(
          (instructionStatus) =>
            (instructionStatus.name === 'createWorkspace' ||
              instructionStatus.name === 'updateWorkspace' ||
              instructionStatus.name === 'deleteWorkspace') &&
            (instructionStatus.status === 'confirmed' ||
              instructionStatus.status === 'finalized') &&
            instructionStatus.accounts.some(
              (account) =>
                account.name === 'Workspace' && account.pubkey === workspaceId
            )
        ),
        tap((workspaceInstruction) =>
          this._workspaceStore.handleWorkspaceInstruction(workspaceInstruction)
        )
      )
    )
  );

  readonly downloadWorkspace = this.effect<string>(
    concatMap((workspaceId) =>
      forkJoin({
        workspace: this._workspaceApiService.findById(workspaceId),
        applications: this._applicationApiService
          .findIds({ workspace: workspaceId })
          .pipe(
            concatMap((applicationIds) =>
              this._applicationApiService
                .findByIds(applicationIds)
                .pipe(
                  concatMap((applications) =>
                    from(applications).pipe(isNotNullOrUndefined, toArray())
                  )
                )
            )
          ),
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
