import {
	Directive,
	EventEmitter,
	HostListener,
	Input,
	Output,
} from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { CollectionAttributeDto } from '@heavy-duty/bulldozer-devkit';
import { EditCollectionAttributeComponent } from './edit-collection-attribute.component';

@Directive({ selector: '[bdEditCollectionAttribute]' })
export class EditCollectionAttributeDirective {
	@Input() collectionAttribute?: CollectionAttributeDto;
	@Output() editCollectionAttribute =
		new EventEmitter<CollectionAttributeDto>();
	@HostListener('click') onClick(): void {
		this._matDialog
			.open<
				EditCollectionAttributeComponent,
				CollectionAttributeDto,
				CollectionAttributeDto
			>(EditCollectionAttributeComponent, {
				data: this.collectionAttribute,
				panelClass: ['bg-bp-wood', 'bg-bp-brown'],
			})
			.afterClosed()
			.subscribe((data) => data && this.editCollectionAttribute.emit(data));
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
