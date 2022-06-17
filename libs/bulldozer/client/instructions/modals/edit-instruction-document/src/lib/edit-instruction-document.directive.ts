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
import { EditInstructionDocumentComponent } from './edit-instruction-document.component';
import { Collection, InstructionAccount } from './types';

@Directive({ selector: '[bdEditInstructionDocument]' })
export class EditInstructionDocumentDirective {
	@Input() instructionDocument: InstructionAccountModel | null = null;
	@Input() collections: List<Collection> | null = null;
	@Input() instructionAccounts: List<InstructionAccount> | null = null;

	@Output() editInstructionDocument =
		new EventEmitter<InstructionAccountModel>();
	@HostListener('click') onClick(): void {
		if (!this.collections || !this.instructionAccounts) {
			throw new Error('Values missing!');
		}

		this._matDialog
			.open<
				EditInstructionDocumentComponent,
				{
					document: InstructionAccountModel | null;
					collections: List<Collection>;
					accounts: List<InstructionAccount>;
				},
				InstructionAccountModel
			>(EditInstructionDocumentComponent, {
				data: {
					document: this.instructionDocument,
					collections: this.collections,
					accounts: this.instructionAccounts,
				},
				panelClass: ['bg-bp-wood', 'bg-bp-brown'],
				maxHeight: '600px',
			})
			.afterClosed()
			.subscribe((data) => data && this.editInstructionDocument.emit(data));
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
