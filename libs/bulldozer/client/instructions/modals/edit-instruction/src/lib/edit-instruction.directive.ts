import {
	Directive,
	EventEmitter,
	HostListener,
	Input,
	Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InstructionDto } from '@heavy-duty/bulldozer-devkit';
import { EditInstructionComponent } from './edit-instruction.component';

@Directive({ selector: '[bdEditInstruction]' })
export class EditInstructionDirective {
	@Input() instruction?: InstructionDto;
	@Output() editInstruction = new EventEmitter<InstructionDto>();
	@HostListener('click') onClick(): void {
		this._matDialog
			.open<EditInstructionComponent, InstructionDto, InstructionDto>(
				EditInstructionComponent,
				{ data: this.instruction, panelClass: ['bg-bp-wood', 'bg-bp-brown'] }
			)
			.afterClosed()
			.subscribe((data) => data && this.editInstruction.emit(data));
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
