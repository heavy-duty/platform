import {
	Directive,
	EventEmitter,
	HostListener,
	Input,
	Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {} from '@bulldozer-client/instructions-data-access';
import { InstructionRelationDto } from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { EditInstructionRelationComponent } from './edit-instruction-relation.component';
import { InstructionAccount } from './types';

@Directive({ selector: '[bdEditInstructionRelation]' })
export class EditInstructionRelationDirective {
	@Input() instructionAccounts: List<InstructionAccount> | null = null;
	@Input() from?: string;
	@Output() editInstructionRelation =
		new EventEmitter<InstructionRelationDto>();
	@HostListener('click') onClick(): void {
		if (!this.instructionAccounts || !this.from) {
			return;
		}

		this._matDialog
			.open<
				EditInstructionRelationComponent,
				{
					accounts: List<InstructionAccount>;
					from: string;
				},
				InstructionRelationDto
			>(EditInstructionRelationComponent, {
				data: {
					accounts: this.instructionAccounts,
					from: this.from,
				},
				panelClass: ['bg-bp-wood', 'bg-bp-brown'],
			})
			.afterClosed()
			.subscribe((data) => data && this.editInstructionRelation.emit(data));
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
