import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';

interface ViewModel {
  collectionId: string | null;
  applicationId: string | null;
  workspaceId: string | null;
}

const initialState: ViewModel = {
  collectionId: null,
  applicationId: null,
  workspaceId: null,
};

@Injectable()
export class ViewCollectionRouteStore extends ComponentStore<ViewModel> {
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(private readonly _route: ActivatedRoute) {
    super(initialState);
  }

  protected loadRouteParameters = this.effect(() =>
    this._route.paramMap.pipe(
      tap((paramMap) =>
        this.patchState({
          collectionId: paramMap.get('collectionId'),
          applicationId: paramMap.get('applicationId'),
          workspaceId: paramMap.get('workspaceId'),
        })
      )
    )
  );
}
