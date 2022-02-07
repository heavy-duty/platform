import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';

interface ViewModel {
  workspaceId: string | null;
}

const initialState: ViewModel = {
  workspaceId: null,
};

@Injectable()
export class ViewWorkspaceRouteStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(private readonly _route: ActivatedRoute) {
    super(initialState);
  }

  protected loadRouteParameters = this.effect(() =>
    this._route.paramMap.pipe(
      tap((paramMap) =>
        this.patchState({
          workspaceId: paramMap.get('workspaceId'),
        })
      )
    )
  );
}
