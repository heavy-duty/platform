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
  InstructionRelation,
  InstructionRelationDto,
  Relation,
} from '@heavy-duty/bulldozer-devkit';
import { EditInstructionRelationComponent } from './edit-instruction-relation.component';

@Directive({ selector: '[bdEditInstructionRelationTrigger]' })
export class EditInstructionRelationTriggerDirective {
  @Input() instructionRelation: Relation<InstructionRelation> | null = null;
  @Input() instructionAccounts: Document<InstructionAccount>[] | null = null;
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
          relation: Relation<InstructionRelation> | null;
          accounts: Document<InstructionAccount>[];
          from: string;
        },
        InstructionRelationDto
      >(EditInstructionRelationComponent, {
        data: {
          relation: this.instructionRelation,
          accounts: this.instructionAccounts,
          from: this.from,
        },
      })
      .afterClosed()
      .subscribe((data) => data && this.editInstructionRelation.emit(data));
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
