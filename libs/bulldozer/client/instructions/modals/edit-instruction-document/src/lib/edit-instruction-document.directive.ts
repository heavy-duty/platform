import {
	Directive,
	EventEmitter,
	HostListener,
	Input,
	Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InstructionAccountDto } from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { EditInstructionDocumentComponent } from './edit-instruction-document.component';
import {
	Collection,
	CollectionAttribute,
	InstructionAccount,
	InstructionAccountsCollectionsLookup,
} from './types';

@Directive({ selector: '[bdEditInstructionDocument]' })
export class EditInstructionDocumentDirective {
	@Input() instructionDocument: InstructionAccountDto | null = null;
	@Input() collections: List<Collection> | null = null;
	@Input() collectionAttributes: List<CollectionAttribute> | null = null;
	@Input() instructionAccounts: List<InstructionAccount> | null = null;
	@Input()
	instructionAccountsCollectionsLookup: List<InstructionAccountsCollectionsLookup> | null =
		null;
	@Output() editInstructionDocument = new EventEmitter<InstructionAccountDto>();
	@HostListener('click') onClick(): void {
		if (
			!this.collections ||
			!this.instructionAccounts ||
			!this.collectionAttributes ||
			!this.instructionAccountsCollectionsLookup
		) {
			throw new Error('Values missing!');
		}

		this._matDialog
			.open<
				EditInstructionDocumentComponent,
				{
					document: InstructionAccountDto | null;
					collections: List<Collection>;
					collectionAttributes: List<CollectionAttribute>;
					accounts: List<InstructionAccount>;
					instructionAccountsCollectionsLookup: List<InstructionAccountsCollectionsLookup>;
				},
				InstructionAccountDto
			>(EditInstructionDocumentComponent, {
				data: {
					document: this.instructionDocument,
					collections: this.collections,
					collectionAttributes: this.collectionAttributes,
					accounts: this.instructionAccounts,
					instructionAccountsCollectionsLookup:
						this.instructionAccountsCollectionsLookup,
				},
				panelClass: ['bg-bp-wood', 'bg-bp-brown'],
				maxHeight: '600px',
			})
			.afterClosed()
			.subscribe((data) => data && this.editInstructionDocument.emit(data));
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
