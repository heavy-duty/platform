import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InstructionAccountItemView } from '@bulldozer-client/instructions-data-access';
import { InstructionRelationDto } from '@heavy-duty/bulldozer-devkit';
import { EditInstructionRelationComponent } from './edit-instruction-relation.component';

@Directive({ selector: '[bdEditInstructionRelation]' })
export class EditInstructionRelationDirective {
  @Input() instructionAccounts: InstructionAccountItemView[] | null = null;
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
          accounts: InstructionAccountItemView[];
          from: string;
        },
        InstructionRelationDto
      >(EditInstructionRelationComponent, {
        data: {
          accounts: this.instructionAccounts,
          from: this.from,
        },
        panelClass: 'bd-bg-image-7',
      })
      .afterClosed()
      .subscribe((data) => data && this.editInstructionRelation.emit(data));
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
