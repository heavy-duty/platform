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
  InstructionAccountDto,
} from '@heavy-duty/bulldozer-devkit';
import { EditInstructionDocumentComponent } from './edit-instruction-document.component';

@Directive({ selector: '[bdEditInstructionDocumentTrigger]' })
export class EditInstructionDocumentTriggerDirective {
  @Input() instructionDocument?: Document<InstructionAccount>;
  @Input() collections?: Document<Collection>[];
  @Input() instructionAccounts?: Document<InstructionAccount>[];
  @Output() editInstructionDocument = new EventEmitter<InstructionAccountDto>();
  @HostListener('click') onClick(): void {
    if (!this.collections || !this.instructionAccounts) {
      return;
    }

    console.log({
      document: this.instructionDocument,
      collections: this.collections,
      accounts: this.instructionAccounts,
    });

    this._matDialog
      .open<
        EditInstructionDocumentComponent,
        {
          document?: Document<InstructionAccount>;
          collections: Document<Collection>[];
          accounts: Document<InstructionAccount>[];
        },
        InstructionAccountDto
      >(EditInstructionDocumentComponent, {
        data: {
          document: this.instructionDocument,
          collections: this.collections,
          accounts: this.instructionAccounts,
        },
      })
      .afterClosed()
      .subscribe((data) => data && this.editInstructionDocument.emit(data));
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
