import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import { EditWorkspaceComponent } from './edit-workspace.component';

@Directive({ selector: '[bdEditWorkspace]' })
export class EditWorkspaceDirective {
  @Input() workspace?: Document<Workspace>;
  @Output() editWorkspace = new EventEmitter<string>();
  @HostListener('click') onClick(): void {
    this._matDialog
      .open<
        EditWorkspaceComponent,
        { workspace?: Document<Workspace> },
        { name: string }
      >(EditWorkspaceComponent, {
        data: { workspace: this.workspace },
        panelClass: 'bd-bg-image-7',
      })
      .afterClosed()
      .subscribe((data) => data && this.editWorkspace.emit(data.name));
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
