import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
import { EditInstructionComponent } from './edit-instruction.component';

@Directive({ selector: '[bdEditInstructionTrigger]' })
export class EditInstructionTriggerDirective {
  @Input() instruction?: Document<Instruction>;
  @Output() editInstruction = new EventEmitter<string>();
  @HostListener('click') onClick(): void {
    this._matDialog
      .open<
        EditInstructionComponent,
        { instruction?: Document<Instruction> },
        { name: string }
      >(EditInstructionComponent, { data: { instruction: this.instruction } })
      .afterClosed()
      .subscribe((data) => data && this.editInstruction.emit(data.name));
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
