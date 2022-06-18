import {
	Directive,
	EventEmitter,
	HostListener,
	Input,
	Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InstructionAccountConstraintModel } from '@heavy-duty/bulldozer-devkit';
import { EditInstructionAccountConstraintComponent } from './edit-instruction-account-constraint.component';

@Directive({ selector: '[bdEditInstructionAccountConstraint]' })
export class EditInstructionAccountConstraintDirective {
	@Input()
	instructionAccountConstraint: InstructionAccountConstraintModel | null = null;

	@Output() editInstructionAccountConstraint =
		new EventEmitter<InstructionAccountConstraintModel>();
	@HostListener('click') onClick(): void {
		this._matDialog
			.open<
				EditInstructionAccountConstraintComponent,
				{
					document: InstructionAccountConstraintModel | null;
				},
				InstructionAccountConstraintModel
			>(EditInstructionAccountConstraintComponent, {
				data: {
					document: this.instructionAccountConstraint,
				},
				panelClass: ['bg-bp-wood', 'bg-bp-brown'],
				maxHeight: '600px',
			})
			.afterClosed()
			.subscribe(
				(data) => data && this.editInstructionAccountConstraint.emit(data)
			);
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
