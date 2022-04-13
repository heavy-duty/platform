import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Document,
  InstructionAccount,
  InstructionAccountDto,
} from '@heavy-duty/bulldozer-devkit';
import { EditInstructionSignerComponent } from './edit-instruction-signer.component';

@Directive({ selector: '[bdEditInstructionSigner]' })
export class EditInstructionSignerDirective {
  @Input() instructionSigner?: Document<InstructionAccount>;
  @Output() editInstructionSigner = new EventEmitter<InstructionAccountDto>();
  @HostListener('click') onClick(): void {
    this._matDialog
      .open<
        EditInstructionSignerComponent,
        {
          signer?: Document<InstructionAccount>;
        },
        InstructionAccountDto
      >(EditInstructionSignerComponent, {
        data: {
          signer: this.instructionSigner,
        },
        panelClass: 'bd-bg-image-7',
      })
      .afterClosed()
      .subscribe((data) => data && this.editInstructionSigner.emit(data));
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
