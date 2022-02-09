import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';

interface ViewModel {
  workspaceId: string | null;
  applicationId: string | null;
}

const initialState: ViewModel = {
  workspaceId: null,
  applicationId: null,
};

@Injectable()
export class ViewApplicationRouteStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);

  constructor(private readonly _route: ActivatedRoute) {
    super(initialState);
  }

  protected loadRouteParameters = this.effect(() =>
    this._route.paramMap.pipe(
      tap((paramMap) =>
        this.patchState({
          workspaceId: paramMap.get('workspaceId'),
          applicationId: paramMap.get('applicationId'),
        })
      )
    )
  );
}
