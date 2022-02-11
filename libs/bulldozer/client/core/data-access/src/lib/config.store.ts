import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';
import { LocalStorageSubject } from './internal';

interface ViewModel {
  workspaceId: string | null;
  isHandset: boolean;
}

const initialState: ViewModel = {
  workspaceId: null,
  isHandset: false,
};

@Injectable({ providedIn: 'root' })
export class ConfigStore extends ComponentStore<ViewModel> {
  private readonly _workspaceId = new LocalStorageSubject<string>(
    'workspaceId'
  );
  readonly isHandset$ = this.select(({ isHandset }) => isHandset);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(private readonly _breakpointObserver: BreakpointObserver) {
    super(initialState);
  }

  readonly loadHandset = this.effect(() =>
    this._breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(tap((result) => this.patchState({ isHandset: result.matches })))
  );

  readonly loadWorkspaceId = this.effect(() =>
    this._workspaceId
      .asObservable()
      .pipe(tap((workspaceId) => this.patchState({ workspaceId })))
  );

  setWorkspaceId(workspaceId: string | null) {
    this._workspaceId.next(workspaceId);
  }
}
