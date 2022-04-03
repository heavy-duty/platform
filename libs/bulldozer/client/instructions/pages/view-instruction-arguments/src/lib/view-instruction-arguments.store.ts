import { Injectable } from '@angular/core';
import {
  InstructionArgumentApiService,
  InstructionArgumentQueryStore,
  InstructionArgumentsStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { InstructionArgumentDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  filter,
  map,
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
export class ViewInstructionArgumentsStore extends ComponentStore<ViewModel> {
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _instructionArgumentApiService: InstructionArgumentApiService,
    private readonly _instructionArgumentsStore: InstructionArgumentsStore,
    private readonly _instructionArgumentQueryStore: InstructionArgumentQueryStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._instructionArgumentQueryStore.setFilters(
      this.instructionId$.pipe(
        isNotNullOrUndefined,
        map((instruction) => ({ instruction }))
      )
    );
    this._instructionArgumentsStore.setInstructionArgumentIds(
      this._instructionArgumentQueryStore.instructionArgumentIds$
    );
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
        case 'createInstructionArgument':
        case 'updateInstructionArgument':
        case 'deleteInstructionArgument': {
          this._instructionArgumentsStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
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
