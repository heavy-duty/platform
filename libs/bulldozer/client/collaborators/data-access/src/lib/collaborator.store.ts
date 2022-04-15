import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { Collaborator, Document } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { CollaboratorApiService } from './collaborator-api.service';

interface ViewModel {
  loading: boolean;
  collaboratorId: string | null;
  collaborator: Document<Collaborator> | null;
}

const initialState: ViewModel = {
  loading: false,
  collaboratorId: null,
  collaborator: null,
};

@Injectable()
export class CollaboratorStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly collaboratorId$ = this.select(
    ({ collaboratorId }) => collaboratorId
  );
  readonly collaborator$ = this.select(({ collaborator }) => collaborator);

  constructor(
    private readonly _collaboratorApiService: CollaboratorApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadCollaborator(this.collaboratorId$);
  }

  readonly setCollaboratorId = this.updater<string | null>(
    (state, collaboratorId) => ({
      ...state,
      collaboratorId,
    })
  );

  private readonly _loadCollaborator = this.effect<string | null>(
    switchMap((collaboratorId) => {
      if (collaboratorId === null) {
        return EMPTY;
      }

      return this._collaboratorApiService.findById(collaboratorId).pipe(
        tapResponse(
          (collaborator) => {
            this.patchState({
              loading: false,
              collaborator,
            });
          },
          (error) => this._notificationStore.setError({ error })
        )
      );
    })
  );
}
