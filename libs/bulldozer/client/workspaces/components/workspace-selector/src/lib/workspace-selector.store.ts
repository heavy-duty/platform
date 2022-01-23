import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import { WorkspaceStore } from '@heavy-duty/bulldozer/application/data-access';
import { EditWorkspaceComponent } from '@heavy-duty/bulldozer/application/features/edit-workspace';
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { exhaustMap, tap } from 'rxjs/operators';

@Injectable()
export class WorkspaceSelectorStore extends ComponentStore<object> {
  readonly workspace$ = this._workspaceStore.workspace$;
  readonly workspaces$ = this._workspaceStore.workspaces$;
  readonly connected$ = this._walletStore.connected$;
  readonly workspaceId$ = this._workspaceStore.workspaceId$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _matDialog: MatDialog
  ) {
    super({});
  }

  readonly createWorkspace = this.effect((action$) =>
    action$.pipe(
      exhaustMap(() =>
        this._matDialog
          .open(EditWorkspaceComponent)
          .afterClosed()
          .pipe(
            isNotNullOrUndefined,
            tap((data) => this._workspaceStore.createWorkspace({ data }))
          )
      )
    )
  );

  readonly updateWorkspace = this.effect(
    (workspace$: Observable<Document<Workspace>>) =>
      workspace$.pipe(
        exhaustMap((workspace) =>
          this._matDialog
            .open(EditWorkspaceComponent, { data: { workspace } })
            .afterClosed()
            .pipe(
              isNotNullOrUndefined,
              tap((changes) =>
                this._workspaceStore.updateWorkspace({
                  workspace,
                  changes,
                })
              )
            )
        )
      )
  );

  readonly deleteWorkspace = this.effect(
    (workspace$: Observable<Document<Workspace>>) =>
      workspace$.pipe(
        tap((workspace) => this._workspaceStore.deleteWorkspace(workspace))
      )
  );

  readonly downloadWorkspace = this.effect((workspaceId$: Observable<string>) =>
    workspaceId$.pipe(
      tap((workspaceId) => this._workspaceStore.downloadWorkspace(workspaceId))
    )
  );
}
