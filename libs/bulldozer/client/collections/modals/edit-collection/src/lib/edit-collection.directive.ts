import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { EditCollectionComponent } from './edit-collection.component';

@Directive({ selector: '[bdEditCollection]' })
export class EditCollectionDirective {
  @Input() collection?: Document<Collection>;
  @Output() editCollection = new EventEmitter<string>();
  @HostListener('click') onClick(): void {
    this._matDialog
      .open<
        EditCollectionComponent,
        { collection?: Document<Collection> },
        { name: string }
      >(EditCollectionComponent, {
        data: { collection: this.collection },
        panelClass: 'bd-bg-image-7',
      })
      .afterClosed()
      .subscribe((data) => data && this.editCollection.emit(data.name));
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
