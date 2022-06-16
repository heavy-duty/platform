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
import { EditInstructionDocumentDerivationComponent } from './edit-instruction-document-derivation.component';
import {
	Collection,
	CollectionAttribute,
	InstructionAccount,
	InstructionAccountDerivation,
	InstructionAccountsCollectionsLookup,
} from './types';

@Directive({ selector: '[bdEditInstructionDocumentDerivation]' })
export class EditInstructionDocumentDerivationDirective {
	@Input() derivation: InstructionAccountDerivation | null = null;
	@Input() instructionDocument: InstructionAccountDto | null = null;
	@Input() collections: List<Collection> | null = null;
	@Input() collectionAttributes: List<CollectionAttribute> | null = null;
	@Input() instructionAccounts: List<InstructionAccount> | null = null;
	@Input()
	instructionAccountsCollectionsLookup: List<InstructionAccountsCollectionsLookup> | null =
		null;
	@Output() editInstructionDocumentDerivation = new EventEmitter<{
		name: string | null;
		seedPaths: List<string>;
		bumpPath: {
			referenceId: string;
			pathId: string;
			collectionId: string;
		} | null;
	}>();
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
				EditInstructionDocumentDerivationComponent,
				{
					document: InstructionAccountDto | null;
					collections: List<Collection>;
					collectionAttributes: List<CollectionAttribute>;
					accounts: List<InstructionAccount>;
					instructionAccountsCollectionsLookup: List<InstructionAccountsCollectionsLookup>;
					derivation: InstructionAccountDerivation | null;
				},
				{
					name: string | null;
					seedPaths: List<string>;
					bumpPath: {
						referenceId: string;
						pathId: string;
						collectionId: string;
					} | null;
				}
			>(EditInstructionDocumentDerivationComponent, {
				data: {
					document: this.instructionDocument,
					collections: this.collections,
					collectionAttributes: this.collectionAttributes,
					accounts: this.instructionAccounts,
					instructionAccountsCollectionsLookup:
						this.instructionAccountsCollectionsLookup,
					derivation: this.derivation,
				},
				panelClass: ['bg-bp-wood', 'bg-bp-brown'],
				maxHeight: '600px',
			})
			.afterClosed()
			.subscribe(
				(data) => data && this.editInstructionDocumentDerivation.emit(data)
			);
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
