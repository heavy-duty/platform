import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditWorkspaceComponent } from '@bulldozer-client/edit-workspace';
import { ImportWorkspaceComponent } from '@bulldozer-client/import-workspace';
import { WorkspaceDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { concatMap, EMPTY, tap } from 'rxjs';
import { AddWorkspaceComponent } from './add-workspace.component';

@Directive({ selector: '[bdAddWorkspace]' })
export class AddWorkspaceDirective {
	@Output() newWorkspace = new EventEmitter<WorkspaceDto>();
	@Output() importWorkspace = new EventEmitter<string>();
	@HostListener('click') onClick(): void {
		this._matDialog
			.open<AddWorkspaceComponent, null, 'new' | 'import' | null>(
				AddWorkspaceComponent,
				{
					panelClass: ['bg-bp-wood', 'bg-bp-brown'],
				}
			)
			.afterClosed()
			.pipe(
				isNotNullOrUndefined,
				concatMap((data) => {
					if (data === 'new') {
						return this._matDialog
							.open<EditWorkspaceComponent, undefined, WorkspaceDto>(
								EditWorkspaceComponent,
								{ panelClass: ['bg-bp-wood', 'bg-bp-brown'] }
							)
							.afterClosed()
							.pipe(tap((data) => data && this.newWorkspace.emit(data)));
					} else if (data === 'import') {
						return this._matDialog
							.open<ImportWorkspaceComponent, null, { pubkey: string }>(
								ImportWorkspaceComponent,
								{ panelClass: ['bg-bp-wood', 'bg-bp-brown'] }
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
