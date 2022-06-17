import {
	Directive,
	EventEmitter,
	HostListener,
	Input,
	Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InstructionAccountModel } from '@heavy-duty/bulldozer-devkit';
import { EditInstructionMintComponent } from './edit-instruction-mint.component';

@Directive({ selector: '[bdEditInstructionMint]' })
export class EditInstructionMintDirective {
	@Input() instructionDocument: InstructionAccountModel | null = null;

	@Output() editInstructionMint = new EventEmitter<InstructionAccountModel>();
	@HostListener('click') onClick(): void {
		this._matDialog
			.open<
				EditInstructionMintComponent,
				{
					document: InstructionAccountModel | null;
				},
				InstructionAccountModel
			>(EditInstructionMintComponent, {
				data: {
					document: this.instructionDocument,
				},
				panelClass: ['bg-bp-wood', 'bg-bp-brown'],
				maxHeight: '600px',
			})
			.afterClosed()
			.subscribe((data) => data && this.editInstructionMint.emit(data));
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
