import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';

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
export class ViewInstructionRouteStore extends ComponentStore<ViewModel> {
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(private readonly _route: ActivatedRoute) {
    super(initialState);
  }

  protected loadRouteParameters = this.effect(() =>
    this._route.paramMap.pipe(
      tap((paramMap) =>
        this.patchState({
          instructionId: paramMap.get('instructionId'),
          applicationId: paramMap.get('applicationId'),
          workspaceId: paramMap.get('workspaceId'),
        })
      )
    )
  );
}
