import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { filter, map, startWith, tap } from 'rxjs';

interface ViewModel {
  workspaceId: string | null;
  isHandset: boolean;
}

const initialState: ViewModel = {
  workspaceId: null,
  isHandset: false,
};

@Injectable()
export class ShellStore extends ComponentStore<ViewModel> {
  readonly isHandset$ = this.select(({ isHandset }) => isHandset);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(
    private readonly _router: Router,
    private readonly _breakpointObserver: BreakpointObserver
  ) {
    super(initialState);
  }

  readonly loadHandset = this.effect(() =>
    this._breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(tap((result) => this.patchState({ isHandset: result.matches })))
  );

  readonly loadWorkspaceId = this.effect(() =>
    this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.url.split('/').filter((segment) => segment)),
      startWith(null),
      tap((urlAsArray) =>
        this.patchState({
          workspaceId:
            urlAsArray !== null &&
            urlAsArray.length >= 2 &&
            urlAsArray[0] === 'workspaces'
              ? urlAsArray[1]
              : null,
        })
      )
    )
  );
}
