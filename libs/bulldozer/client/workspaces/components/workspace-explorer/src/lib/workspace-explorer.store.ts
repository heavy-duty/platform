import { Injectable } from '@angular/core';
import { ApplicationApiService } from '@bulldozer-client/applications-data-access';
import {
  CollectionApiService,
  CollectionAttributeApiService,
} from '@bulldozer-client/collections-data-access';
import {
  InstructionAccountApiService,
  InstructionApiService,
  InstructionArgumentApiService,
  InstructionRelationApiService,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  InstructionStatus,
  UserApiService,
  UserInstructionsStore,
  UserStore,
} from '@bulldozer-client/users-data-access';
import {
  WorkspaceApiService,
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
  forkJoin,
  from,
  of,
  pipe,
  tap,
  toArray,
  withLatestFrom,
} from 'rxjs';

interface ViewModel {
  workspaceId: string | null;
}

const initialState: ViewModel = {
  workspaceId: null,
};

@Injectable()
export class WorkspaceExplorerStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _applicationApiService: ApplicationApiService,
    private readonly _collectionApiService: CollectionApiService,
    private readonly _collectionAttributeApiService: CollectionAttributeApiService,
    private readonly _instructionApiService: InstructionApiService,
    private readonly _instructionArgumentApiService: InstructionArgumentApiService,
    private readonly _instructionAccountApiService: InstructionAccountApiService,
    private readonly _instructionRelationApiService: InstructionRelationApiService,
    private readonly _userApiService: UserApiService,
    private readonly _notificationStore: NotificationStore,
    private readonly _walletStore: WalletStore,
    private readonly _userStore: UserStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _userInstructionsStore: UserInstructionsStore
  ) {
    super(initialState);

    this._workspaceStore.setWorkspaceId(this.workspaceId$);
    this._handleInstruction(this._userInstructionsStore.instruction$);
  }

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({ ...state, workspaceId })
  );

  private readonly _handleInstruction = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        case 'createUser':
        case 'deleteUser': {
          this._userStore.handleUserInstruction(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
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
        collections: this._collectionApiService
          .findIds({ workspace: workspaceId })
          .pipe(
            concatMap((collectionIds) =>
              this._collectionApiService
                .findByIds(collectionIds)
                .pipe(
                  concatMap((collections) =>
                    from(collections).pipe(isNotNullOrUndefined, toArray())
                  )
                )
            )
          ),
        collectionAttributes: this._collectionAttributeApiService
          .findIds({ workspace: workspaceId })
          .pipe(
            concatMap((collectionAttributeIds) =>
              this._collectionAttributeApiService
                .findByIds(collectionAttributeIds)
                .pipe(
                  concatMap((collectionAttributes) =>
                    from(collectionAttributes).pipe(
                      isNotNullOrUndefined,
                      toArray()
                    )
                  )
                )
            )
          ),
        instructions: this._instructionApiService
          .findIds({
            workspace: workspaceId,
          })
          .pipe(
            concatMap((instructionIds) =>
              this._instructionApiService
                .findByIds(instructionIds)
                .pipe(
                  concatMap((instructions) =>
                    from(instructions).pipe(isNotNullOrUndefined, toArray())
                  )
                )
            )
          ),
        instructionArguments: this._instructionArgumentApiService
          .findIds({
            workspace: workspaceId,
          })
          .pipe(
            concatMap((instructionArgumentIds) =>
              this._instructionArgumentApiService
                .findByIds(instructionArgumentIds)
                .pipe(
                  concatMap((instructionArguments) =>
                    from(instructionArguments).pipe(
                      isNotNullOrUndefined,
                      toArray()
                    )
                  )
                )
            )
          ),
        instructionAccounts: this._instructionAccountApiService
          .findIds({
            workspace: workspaceId,
          })
          .pipe(
            concatMap((instructionAccountIds) =>
              this._instructionAccountApiService
                .findByIds(instructionAccountIds)
                .pipe(
                  concatMap((instructionAccounts) =>
                    from(instructionAccounts).pipe(
                      isNotNullOrUndefined,
                      toArray()
                    )
                  )
                )
            )
          ),
        instructionRelations: this._instructionRelationApiService
          .findIds({
            workspace: workspaceId,
          })
          .pipe(
            concatMap((instructionRelationIds) =>
              this._instructionRelationApiService
                .findByIds(instructionRelationIds)
                .pipe(
                  concatMap((instructionRelations) =>
                    from(instructionRelations).pipe(
                      isNotNullOrUndefined,
                      toArray()
                    )
                  )
                )
            )
          ),
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

  readonly createUser = this.effect<{
    name: string;
    userName: string;
    thumbnailUrl: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ name, userName, thumbnailUrl }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._userApiService
          .create({
            authority: authority.toBase58(),
            name,
            userName,
            thumbnailUrl,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent('Create user request sent'),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
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

  readonly createApplication = this.effect<{
    workspaceId: string;
    applicationName: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ workspaceId, applicationName }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._applicationApiService
          .create({
            authority: authority.toBase58(),
            workspaceId,
            applicationName,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Create application request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );
}
