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
  InstructionArgument,
  InstructionArgumentDto,
} from '@heavy-duty/bulldozer-devkit';
import { EditInstructionArgumentComponent } from './edit-instruction-argument.component';

@Directive({ selector: '[bdEditInstructionArgumentTrigger]' })
export class EditInstructionArgumentTriggerDirective {
  @Input() instructionArgument?: Document<InstructionArgument>;
  @Output() editInstructionArgument =
    new EventEmitter<InstructionArgumentDto>();
  @HostListener('click') onClick(): void {
    this._matDialog
      .open<
        EditInstructionArgumentComponent,
        { instructionArgument?: Document<InstructionArgument> },
        InstructionArgumentDto
      >(EditInstructionArgumentComponent, {
        data: { instructionArgument: this.instructionArgument },
      })
      .afterClosed()
      .subscribe((data) => data && this.editInstructionArgument.emit(data));
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
