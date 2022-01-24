import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { ApplicationStore } from '@heavy-duty/bulldozer-store';
import { EditApplicationComponent } from '@heavy-duty/bulldozer/application/features/edit-application';
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

  readonly createApplication = this.effect(($) =>
    $.pipe(
      exhaustMap(() =>
        this._matDialog
          .open(EditApplicationComponent)
          .afterClosed()
          .pipe(
            filter((data) => data),
            tap(({ name }) => this._applicationStore.createApplication(name))
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
              tap(({ name }) =>
                this._applicationStore.updateApplication({
                  applicationId: application.id,
                  applicationName: name,
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
          this._applicationStore.deleteApplication(application.id)
        )
      )
  );
}
