import { Injectable } from '@angular/core';
import {
  InstructionArgumentApiService,
  InstructionArgumentsStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionArgumentDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, map, of, pipe, withLatestFrom } from 'rxjs';

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
    private readonly _instructionArgumentsStore: InstructionArgumentsStore
  ) {
    super(initialState);

    this._instructionArgumentsStore.setFilters(
      this.instructionId$.pipe(
        isNotNullOrUndefined,
        map((instruction) => ({ instruction }))
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
