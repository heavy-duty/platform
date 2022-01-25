import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Collection,
  Document,
  InstructionAccount,
  InstructionRelation,
  InstructionRelationDto,
  Relation,
} from '@heavy-duty/bulldozer-devkit';
import { EditInstructionRelationComponent } from './edit-instruction-relation.component';

@Directive({ selector: '[bdEditInstructionRelationTrigger]' })
export class EditInstructionRelationTriggerDirective {
  @Input() instructionRelation?: Relation<InstructionRelation>;
  @Input() collections?: Document<Collection>[];
  @Input() instructionAccounts?: Document<InstructionAccount>[];
  @Input() from?: string;
  @Output() editInstructionRelation =
    new EventEmitter<InstructionRelationDto>();
  @HostListener('click') onClick(): void {
    if (!this.collections || !this.instructionAccounts || !this.from) {
      return;
    }

    this._matDialog
      .open<
        EditInstructionRelationComponent,
        {
          relation?: Relation<InstructionRelation>;
          collections: Document<Collection>[];
          accounts: Document<InstructionAccount>[];
          from: string;
        },
        InstructionRelationDto
      >(EditInstructionRelationComponent, {
        data: {
          relation: this.instructionRelation,
          collections: this.collections,
          accounts: this.instructionAccounts,
          from: this.from,
        },
      })
      .afterClosed()
      .subscribe((data) => data && this.editInstructionRelation.emit(data));
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
