import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  CollectionAttribute,
  CollectionAttributeDto,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { EditCollectionAttributeComponent } from './edit-collection-attribute.component';

@Directive({ selector: '[bdEditCollectionAttributeTrigger]' })
export class EditCollectionAttributeTriggerDirective {
  @Input() collectionAttribute?: Document<CollectionAttribute>;
  @Output() editCollectionAttribute =
    new EventEmitter<CollectionAttributeDto>();
  @HostListener('click') onClick(): void {
    this._matDialog
      .open<
        EditCollectionAttributeComponent,
        { collectionAttribute?: Document<CollectionAttribute> },
        CollectionAttributeDto
      >(EditCollectionAttributeComponent, {
        data: { collectionAttribute: this.collectionAttribute },
      })
      .afterClosed()
      .subscribe((data) => data && this.editCollectionAttribute.emit(data));
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
