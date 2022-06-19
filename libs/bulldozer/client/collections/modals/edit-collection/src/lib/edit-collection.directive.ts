import {
	Directive,
	EventEmitter,
	HostListener,
	Input,
	Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CollectionDto } from '@heavy-duty/bulldozer-devkit';
import { EditCollectionComponent } from './edit-collection.component';

@Directive({ selector: '[bdEditCollection]' })
export class EditCollectionDirective {
	@Input() collection?: CollectionDto;
	@Output() editCollection = new EventEmitter<CollectionDto>();
	@HostListener('click') onClick(): void {
		this._matDialog
			.open<EditCollectionComponent, CollectionDto, CollectionDto>(
				EditCollectionComponent,
				{
					data: this.collection,
					panelClass: ['bg-bp-wood', 'bg-bp-brown'],
				}
			)
			.afterClosed()
			.subscribe((data) => data && this.editCollection.emit(data));
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
