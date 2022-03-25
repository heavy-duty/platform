import { Injectable } from '@angular/core';
import {
  ApplicationApiService,
  ApplicationQueryStore,
  ApplicationsStore,
} from '@bulldozer-client/applications-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  filter,
  from,
  map,
  merge,
  of,
  pipe,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs';

interface ViewModel {
  workspaceId: string | null;
}

const initialState: ViewModel = {
  workspaceId: null,
};

@Injectable()
export class ApplicationExplorerStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(
    private readonly _applicationApiService: ApplicationApiService,
    private readonly _applicationQueryStore: ApplicationQueryStore,
    private readonly _applicationsStore: ApplicationsStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _workspaceInstructionsStore: WorkspaceInstructionsStore,
    private readonly _walletStore: WalletStore
  ) {
    super(initialState);

    this._applicationQueryStore.setFilters(
      this.workspaceId$.pipe(
        isNotNullOrUndefined,
        map((workspace) => ({ workspace }))
      )
    );
    this._applicationsStore.setApplicationIds(
      this._applicationQueryStore.applicationIds$
    );
    this._watchApplications(this._applicationQueryStore.applicationIds$);
  }

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({ ...state, workspaceId })
  );

  private readonly _watchApplications = this.effect(
    switchMap(() =>
      merge(
        this._workspaceInstructionsStore.instructionStatuses$.pipe(
          take(1),
          concatMap((instructionStatuses) => from(instructionStatuses))
        ),
        this._workspaceInstructionsStore.lastInstructionStatus$.pipe(
          isNotNullOrUndefined
        )
      ).pipe(
        filter(
          (instructionStatus) =>
            (instructionStatus.name === 'createApplication' ||
              instructionStatus.name === 'updateApplication' ||
              instructionStatus.name === 'deleteApplication') &&
            (instructionStatus.status === 'confirmed' ||
              instructionStatus.status === 'finalized')
        ),
        tap((applicationInstruction) =>
          this._applicationsStore.handleApplicationInstruction(
            applicationInstruction
          )
        )
      )
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
      concatMap(([{ applicationName, workspaceId }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._applicationApiService
          .create({
            applicationName,
            authority: authority.toBase58(),
            workspaceId,
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

  readonly updateApplication = this.effect<{
    workspaceId: string;
    applicationId: string;
    applicationName: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([{ workspaceId, applicationId, applicationName }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._applicationApiService
            .update({
              authority: authority.toBase58(),
              workspaceId,
              applicationName,
              applicationId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Update application request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly deleteApplication = this.effect<{
    workspaceId: string;
    applicationId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ workspaceId, applicationId }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._applicationApiService
          .delete({
            authority: authority.toBase58(),
            workspaceId,
            applicationId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Delete application request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );
}
