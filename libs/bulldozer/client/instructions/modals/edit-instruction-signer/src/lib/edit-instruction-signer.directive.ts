import {
	Directive,
	EventEmitter,
	HostListener,
	Input,
	Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InstructionAccountDto } from '@heavy-duty/bulldozer-devkit';
import { EditInstructionSignerComponent } from './edit-instruction-signer.component';

@Directive({ selector: '[bdEditInstructionSigner]' })
export class EditInstructionSignerDirective {
	@Input() instructionSigner?: InstructionAccountDto;
	@Output() editInstructionSigner = new EventEmitter<InstructionAccountDto>();
	@HostListener('click') onClick(): void {
		this._matDialog
			.open<
				EditInstructionSignerComponent,
				InstructionAccountDto,
				InstructionAccountDto
			>(EditInstructionSignerComponent, {
				data: this.instructionSigner,
				panelClass: ['bg-bp-wood', 'bg-bp-brown'],
			})
			.afterClosed()
			.subscribe((data) => data && this.editInstructionSigner.emit(data));
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
