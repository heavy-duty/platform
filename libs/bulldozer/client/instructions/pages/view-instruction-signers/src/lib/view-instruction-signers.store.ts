import { Injectable } from '@angular/core';
import {
  InstructionAccountApiService,
  InstructionAccountQueryStore,
  InstructionAccountsStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { InstructionAccountDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import base58 from 'bs58';
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
export class ViewInstructionSignersStore extends ComponentStore<ViewModel> {
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _instructionAccountApiService: InstructionAccountApiService,
    private readonly _instructionAccountsStore: InstructionAccountsStore,
    private readonly _instructionAccountQueryStore: InstructionAccountQueryStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._instructionAccountQueryStore.setFilters(
      this.instructionId$.pipe(
        isNotNullOrUndefined,
        map((instruction) => ({
          instruction,
          accountKind: base58.encode(Buffer.from([0])),
        }))
      )
    );
    this._instructionAccountsStore.setInstructionAccountIds(
      this._instructionAccountQueryStore.instructionAccountIds$
    );
    this._handleInstruction(workspaceInstructionsStore.instruction$);
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
        case 'createInstructionAccount':
        case 'updateInstructionAccount':
        case 'deleteInstructionAccount': {
          this._instructionAccountsStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
  );

  readonly createInstructionAccount = this.effect<{
    workspaceId: string;
    applicationId: string;
    instructionId: string;
    instructionAccountDto: InstructionAccountDto;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          { workspaceId, applicationId, instructionId, instructionAccountDto },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionAccountApiService
            .create({
              instructionAccountDto,
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

  readonly updateInstructionAccount = this.effect<{
    workspaceId: string;
    instructionId: string;
    instructionAccountId: string;
    instructionAccountDto: InstructionAccountDto;
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
            instructionAccountId,
            instructionAccountDto,
          },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionAccountApiService
            .update({
              authority: authority.toBase58(),
              workspaceId,
              instructionId,
              instructionAccountDto,
              instructionAccountId,
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

  readonly deleteInstructionAccount = this.effect<{
    workspaceId: string;
    instructionId: string;
    instructionAccountId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([{ workspaceId, instructionId, instructionAccountId }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionAccountApiService
            .delete({
              authority: authority.toBase58(),
              workspaceId,
              instructionAccountId,
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
