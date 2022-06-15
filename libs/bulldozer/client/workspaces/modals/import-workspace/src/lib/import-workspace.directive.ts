import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ImportWorkspaceComponent } from './import-workspace.component';

@Directive({ selector: '[bdImportWorkspace]' })
export class ImportWorkspaceDirective {
	@Output() importWorkspace = new EventEmitter<string>();
	@HostListener('click') onClick(): void {
		this._matDialog
			.open<ImportWorkspaceComponent, null, { pubkey: string }>(
				ImportWorkspaceComponent,
				{
					panelClass: ['bg-bp-wood', 'bg-bp-brown'],
				}
			)
			.afterClosed()
			.subscribe((data) => data && this.importWorkspace.emit(data.pubkey));
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
