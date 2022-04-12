import { Injectable } from '@angular/core';
import { TabStore } from '@bulldozer-client/core-data-access';
import {
  InstructionApiService,
  InstructionStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { InstructionDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
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
    private readonly _instructionStore: InstructionStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._instructionStore.setInstructionId(this.instructionId$);
    this._handleInstruction(
      this.instructionId$.pipe(
        isNotNullOrUndefined,
        switchMap((instructionId) =>
          workspaceInstructionsStore.instruction$.pipe(
            filter((instruction) =>
              instruction.accounts.some(
                (account) =>
                  account.name === 'Instruction' &&
                  account.pubkey === instructionId
              )
            )
          )
        )
      )
    );
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

  readonly updateInstruction = this.effect<{
    workspaceId: string;
    applicationId: string;
    instructionId: string;
    instructionDto: InstructionDto;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          { workspaceId, applicationId, instructionId, instructionDto },
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
              instructionId,
              instructionDto,
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
