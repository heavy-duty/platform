import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { EditApplicationComponent } from './edit-application.component';

@Directive({ selector: '[bdEditApplicationTrigger]' })
export class EditApplicationTriggerDirective {
  @Input() application?: Document<Application>;
  @Output() editApplication = new EventEmitter<string>();
  @HostListener('click') onClick(): void {
    this._matDialog
      .open<
        EditApplicationComponent,
        { application?: Document<Application> },
        { name: string }
      >(EditApplicationComponent, { data: { application: this.application } })
      .afterClosed()
      .subscribe((data) => data && this.editApplication.emit(data.name));
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
