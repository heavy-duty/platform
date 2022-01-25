import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { filter, map, startWith, Subject, tap } from 'rxjs';

interface ViewModel {
  workspaceId?: string;
  applicationId?: string;
  collectionId?: string;
  instructionId?: string;
}

const initialState: ViewModel = {};

@Injectable()
export class RouteStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);

  constructor(
    private readonly _router: Router,
    private readonly _walletStore: WalletStore,
    private readonly _route: ActivatedRoute,
    private readonly _bulldozerProgramStore: BulldozerProgramStore
  ) {
    super(initialState);
  }

  readonly loadWorkspaceId$ = this.effect(() =>
    this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.url.split('/').filter((segment) => segment)[1]),
      startWith(this._route.snapshot.paramMap.get('workspaceId')),
      tap((workspaceId) => {
        // store locally the workspaceId
        this.patchState({ workspaceId: workspaceId || undefined });
        // set the workspace active in the program store
        this._bulldozerProgramStore.setWorkspaceId(workspaceId || undefined);
      })
    )
  );

  readonly loadApplicationId$ = this.effect(() =>
    this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.url.split('/').filter((segment) => segment)[3]),
      startWith(this._route.snapshot.paramMap.get('applicationId')),
      tap((applicationId) =>
        this.patchState({ applicationId: applicationId || undefined })
      )
    )
  );

  readonly loadCollectionId$ = this.effect(() =>
    this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.url.split('/').filter((segment) => segment)[5]),
      startWith(this._route.snapshot.paramMap.get('collectionId')),
      tap((collectionId) =>
        this.patchState({ collectionId: collectionId || undefined })
      )
    )
  );

  readonly loadInstructionId$ = this.effect(() =>
    this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.url.split('/').filter((segment) => segment)[5]),
      startWith(this._route.snapshot.paramMap.get('instructionId')),
      tap((instructionId) =>
        this.patchState({ instructionId: instructionId || undefined })
      )
    )
  );

  readonly redirectUnauthorized = this.effect(() =>
    this._walletStore.connected$.pipe(
      filter((connected) => !connected),
      tap(() =>
        this._router.navigate(['/unauthorized-access'], {
          queryParams: {
            redirect: this._router.routerState.snapshot.url,
          },
        })
      )
    )
  );
}
