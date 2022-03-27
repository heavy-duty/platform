import { Injectable } from '@angular/core';
import {
  InstructionApiService,
  InstructionQueryStore,
  InstructionsStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  combineLatest,
  concatMap,
  EMPTY,
  filter,
  of,
  pipe,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';

interface ViewModel {
  applicationId: string | null;
  workspaceId: string | null;
}

const initialState: ViewModel = {
  applicationId: null,
  workspaceId: null,
};

@Injectable()
export class InstructionExplorerStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);

  constructor(
    private readonly _instructionApiService: InstructionApiService,
    private readonly _instructionQueryStore: InstructionQueryStore,
    private readonly _instructionsStore: InstructionsStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _walletStore: WalletStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._instructionQueryStore.setFilters(
      combineLatest({
        application: this.applicationId$.pipe(isNotNullOrUndefined),
      })
    );
    this._instructionsStore.setInstructionIds(
      this._instructionQueryStore.instructionIds$
    );
    this._handleInstruction(
      this.applicationId$.pipe(
        isNotNullOrUndefined,
        switchMap((applicationId) =>
          workspaceInstructionsStore.instruction$.pipe(
            filter((instruction) =>
              instruction.accounts.some(
                (account) =>
                  account.name === 'Application' &&
                  account.pubkey === applicationId
              )
            )
          )
        )
      )
    );
  }

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({ ...state, workspaceId })
  );

  readonly setApplicationId = this.updater<string | null>(
    (state, applicationId) => ({ ...state, applicationId })
  );

  private readonly _handleInstruction = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        case 'createInstruction':
        case 'updateInstruction':
        case 'deleteInstruction': {
          this._instructionsStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
  );

  readonly createInstruction = this.effect<{
    workspaceId: string;
    applicationId: string;
    instructionName: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([{ instructionName, workspaceId, applicationId }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionApiService
            .create({
              instructionName,
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Create instruction request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly updateInstruction = this.effect<{
    workspaceId: string;
    applicationId: string;
    instructionId: string;
    instructionName: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          { workspaceId, applicationId, instructionId, instructionName },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionApiService
            .update({
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
              instructionName,
              instructionId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Update instruction request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly deleteInstruction = this.effect<{
    workspaceId: string;
    applicationId: string;
    instructionId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([{ workspaceId, instructionId, applicationId }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionApiService
            .delete({
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
              instructionId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Delete instruction request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );
}
