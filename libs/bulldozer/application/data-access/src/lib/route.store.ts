import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { filter, tap } from 'rxjs';

interface ViewModel {
  workspaceId?: string;
  applicationId?: string;
  collectionId?: string;
  instructionId?: string;
}

const initialState: ViewModel = {};

@Injectable()
export class RouteStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);

  constructor(
    private readonly _router: Router,
    private readonly _walletStore: WalletStore,
    private readonly _bulldozerProgramStore: BulldozerProgramStore
  ) {
    super(initialState);

    this._bulldozerProgramStore.setWorkspaceId(this.workspaceId$);
  }

  readonly loadIds$ = this.effect(() =>
    this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      tap((event) => {
        const urlAsArray = event.url.split('/').filter((segment) => segment);

        this.patchState({
          workspaceId:
            urlAsArray[0] === 'workspaces' ? urlAsArray[1] : undefined,
          applicationId:
            urlAsArray[2] === 'applications' ? urlAsArray[3] : undefined,
          collectionId:
            urlAsArray[4] === 'collections' ? urlAsArray[5] : undefined,
          instructionId:
            urlAsArray[4] === 'instructions' ? urlAsArray[5] : undefined,
        });
      })
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
