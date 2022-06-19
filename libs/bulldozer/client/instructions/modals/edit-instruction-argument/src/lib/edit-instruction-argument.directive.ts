import {
	Directive,
	EventEmitter,
	HostListener,
	Input,
	Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InstructionArgumentDto } from '@heavy-duty/bulldozer-devkit';
import { EditInstructionArgumentComponent } from './edit-instruction-argument.component';

@Directive({ selector: '[bdEditInstructionArgument]' })
export class EditInstructionArgumentDirective {
	@Input() instructionArgument?: InstructionArgumentDto;
	@Output() editInstructionArgument =
		new EventEmitter<InstructionArgumentDto>();
	@HostListener('click') onClick(): void {
		this._matDialog
			.open<
				EditInstructionArgumentComponent,
				InstructionArgumentDto,
				InstructionArgumentDto
			>(EditInstructionArgumentComponent, {
				data: this.instructionArgument,
				panelClass: ['bg-bp-wood', 'bg-bp-brown'],
			})
			.afterClosed()
			.subscribe((data) => data && this.editInstructionArgument.emit(data));
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
