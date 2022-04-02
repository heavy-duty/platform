import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Document, User } from '@heavy-duty/bulldozer-devkit';
import { EditUserComponent } from './edit-user.component';

@Directive({ selector: '[bdEditUser]' })
export class EditUserDirective {
  @Input() user?: Document<User>;
  @Output() editUser = new EventEmitter<{
    name: string;
    userName: string;
    thumbnailUrl: string;
  }>();
  @HostListener('click') onClick(): void {
    this._matDialog
      .open<
        EditUserComponent,
        { user?: Document<User> },
        { name: string; userName: string; thumbnailUrl: string }
      >(EditUserComponent, { data: { user: this.user } })
      .afterClosed()
      .subscribe((data) => data && this.editUser.emit(data));
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
