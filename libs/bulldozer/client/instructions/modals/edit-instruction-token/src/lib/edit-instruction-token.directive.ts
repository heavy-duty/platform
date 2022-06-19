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
import { EditInstructionTokenComponent } from './edit-instruction-token.component';
import { InstructionAccount } from './types';

@Directive({ selector: '[bdEditInstructionToken]' })
export class EditInstructionTokenDirective {
	@Input() instructionDocument: InstructionAccountModel | null = null;
	@Input() instructionAccounts: List<InstructionAccount> | null = null;

	@Output() editInstructionToken = new EventEmitter<InstructionAccountModel>();
	@HostListener('click') onClick(): void {
		if (!this.instructionAccounts) {
			throw new Error('Values missing!');
		}

		this._matDialog
			.open<
				EditInstructionTokenComponent,
				{
					document: InstructionAccountModel | null;
					accounts: List<InstructionAccount>;
				},
				InstructionAccountModel
			>(EditInstructionTokenComponent, {
				data: {
					document: this.instructionDocument,
					accounts: this.instructionAccounts,
				},
				panelClass: ['bg-bp-wood', 'bg-bp-brown'],
				maxHeight: '600px',
			})
			.afterClosed()
			.subscribe((data) => data && this.editInstructionToken.emit(data));
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
