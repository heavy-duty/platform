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
import { InstructionAccount } from './types';

@Directive({ selector: '[bdEditInstructionUnchecked]' })
export class EditInstructionUncheckedDirective {
	@Input() instructionDocument: InstructionAccountModel | null = null;
	@Input() instructionAccounts: List<InstructionAccount> | null = null;

	@Output() editInstructionUnchecked =
		new EventEmitter<InstructionAccountModel>();
	@HostListener('click') onClick(): void {
		if (!this.instructionAccounts) {
			throw new Error('Values missing!');
		}

		this._matDialog
			.open<
				EditInstructionUncheckedComponent,
				{
					document: InstructionAccountModel | null;
					accounts: List<InstructionAccount>;
				},
				InstructionAccountModel
			>(EditInstructionUncheckedComponent, {
				data: {
					document: this.instructionDocument,
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
