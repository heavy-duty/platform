import {
	Directive,
	EventEmitter,
	HostListener,
	Input,
	Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WorkspaceDto } from '@heavy-duty/bulldozer-devkit';
import { EditWorkspaceComponent } from './edit-workspace.component';

@Directive({ selector: '[bdEditWorkspace]' })
export class EditWorkspaceDirective {
	@Input() workspace?: WorkspaceDto;
	@Output() editWorkspace = new EventEmitter<WorkspaceDto>();
	@HostListener('click') onClick(): void {
		this._matDialog
			.open<EditWorkspaceComponent, WorkspaceDto, WorkspaceDto>(
				EditWorkspaceComponent,
				{
					data: this.workspace,
					panelClass: ['bg-bp-wood', 'bg-bp-brown'],
				}
			)
			.afterClosed()
			.subscribe((data) => data && this.editWorkspace.emit(data));
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
