import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { Collaborator, Document } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, startWith, switchMap } from 'rxjs';
import { CollaboratorApiService } from './collaborator-api.service';
import { CollaboratorEventService } from './collaborator-event.service';

interface ViewModel {
  collaboratorId: string | null;
  collaborator: Document<Collaborator> | null;
}

const initialState: ViewModel = {
  collaboratorId: null,
  collaborator: null,
};

@Injectable()
export class CollaboratorStore extends ComponentStore<ViewModel> {
  readonly collaborator$ = this.select(({ collaborator }) => collaborator);
  readonly collaboratorId$ = this.select(
    ({ collaboratorId }) => collaboratorId
  );

  constructor(
    private readonly _collaboratorApiService: CollaboratorApiService,
    private readonly _collaboratorEventService: CollaboratorEventService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadCollaborator(this.collaboratorId$);
  }

  private readonly _loadCollaborator = this.effect<string | null>(
    switchMap((collaboratorId) => {
      if (collaboratorId === null) {
        return EMPTY;
      }

      return this._collaboratorApiService
        .findById(collaboratorId)
        .pipe(
          concatMap((collaborator) =>
            this._collaboratorEventService
              .collaboratorChanges(collaboratorId)
              .pipe(startWith(collaborator))
          )
        )
        .pipe(
          tapResponse(
            (collaborator) => this.patchState({ collaborator }),
            (error) => this._notificationStore.setError({ error })
          )
        );
    })
  );

  readonly setCollaboratorId = this.updater<string | null>(
    (state, collaboratorId) => ({
      ...state,
      collaboratorId,
    })
  );
}
