import {
	Directive,
	EventEmitter,
	HostListener,
	Input,
	Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InstructionAccountModel } from '@heavy-duty/bulldozer-devkit';

import { List } from 'immutable';
import { EditInstructionUncheckedComponent } from './edit-instruction-unchecked.component';
import { Collection, CollectionAttribute, InstructionAccount } from './types';

@Directive({ selector: '[bdEditInstructionUnchecked]' })
export class EditInstructionUncheckedDirective {
	@Input() instructionUnchecked: InstructionAccountModel | null = null;
	@Input() collections: List<Collection> | null = null;
	@Input() collectionAttributes: List<CollectionAttribute> | null = null;
	@Input() instructionAccounts: List<InstructionAccount> | null = null;

	@Output() editInstructionUnchecked =
		new EventEmitter<InstructionAccountModel>();
	@HostListener('click') onClick(): void {
		if (
			!this.collections ||
			!this.instructionAccounts ||
			!this.collectionAttributes
		) {
			throw new Error('Values missing!');
		}

		this._matDialog
			.open<
				EditInstructionUncheckedComponent,
				{
					document: InstructionAccountModel | null;
					collections: List<Collection>;
					collectionAttributes: List<CollectionAttribute>;
					accounts: List<InstructionAccount>;
				},
				InstructionAccountModel
			>(EditInstructionUncheckedComponent, {
				data: {
					document: this.instructionUnchecked,
					collections: this.collections,
					collectionAttributes: this.collectionAttributes,
					accounts: this.instructionAccounts,
				},
				panelClass: ['bg-bp-wood', 'bg-bp-brown'],
				maxHeight: '600px',
			})
			.afterClosed()
			.subscribe((data) => data && this.editInstructionUnchecked.emit(data));
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
