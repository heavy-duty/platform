import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { ApplicationStore } from '@heavy-duty/bulldozer/application/data-access';
import { EditApplicationComponent } from '@heavy-duty/bulldozer/application/features/edit-application';
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { exhaustMap, filter, tap } from 'rxjs/operators';

@Injectable()
export class ApplicationExplorerStore extends ComponentStore<object> {
  readonly connected$ = this._walletStore.connected$;
  readonly applications$ = this._applicationStore.applications$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _matDialog: MatDialog
  ) {
    super({});
  }

  readonly createApplication = this.effect((workspaceId$: Observable<string>) =>
    workspaceId$.pipe(
      exhaustMap((workspaceId) =>
        this._matDialog
          .open(EditApplicationComponent)
          .afterClosed()
          .pipe(
            isNotNullOrUndefined,
            tap((data) =>
              this._applicationStore.createApplication({
                workspaceId,
                data,
              })
            )
          )
      )
    )
  );

  readonly updateApplication = this.effect(
    (application$: Observable<Document<Application>>) =>
      application$.pipe(
        exhaustMap((application) =>
          this._matDialog
            .open(EditApplicationComponent, { data: { application } })
            .afterClosed()
            .pipe(
              filter((changes) => changes),
              tap((changes) =>
                this._applicationStore.updateApplication({
                  application,
                  changes,
                })
              )
            )
        )
      )
  );

  readonly deleteApplication = this.effect(
    (application$: Observable<Document<Application>>) =>
      application$.pipe(
        tap((application) =>
          this._applicationStore.deleteApplication(application)
        )
      )
  );
}
