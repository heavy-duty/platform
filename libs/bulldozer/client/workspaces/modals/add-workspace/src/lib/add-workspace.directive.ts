import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditWorkspaceComponent } from '@bulldozer-client/edit-workspace';
import { ImportWorkspaceComponent } from '@bulldozer-client/import-workspace';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { concatMap, EMPTY, tap } from 'rxjs';
import { AddWorkspaceComponent } from './add-workspace.component';

@Directive({ selector: '[bdAddWorkspace]' })
export class AddWorkspaceDirective {
  @Output() newWorkspace = new EventEmitter<string>();
  @Output() importWorkspace = new EventEmitter<string>();
  @HostListener('click') onClick(): void {
    this._matDialog
      .open<AddWorkspaceComponent, null, 'new' | 'import' | null>(
        AddWorkspaceComponent
      )
      .afterClosed()
      .pipe(
        isNotNullOrUndefined,
        concatMap((data) => {
          if (data === 'new') {
            return this._matDialog
              .open<
                EditWorkspaceComponent,
                { workspace: undefined },
                { name: string }
              >(EditWorkspaceComponent, { data: { workspace: undefined } })
              .afterClosed()
              .pipe(tap((data) => data && this.newWorkspace.emit(data.name)));
          } else if (data === 'import') {
            return this._matDialog
              .open<ImportWorkspaceComponent, null, { pubkey: string }>(
                ImportWorkspaceComponent
              )
              .afterClosed()
              .pipe(
                tap((data) => data && this.importWorkspace.emit(data.pubkey))
              );
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe();
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
