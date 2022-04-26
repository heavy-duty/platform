import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InstructionAccountDto } from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { EditInstructionDocumentComponent } from './edit-instruction-document.component';
import { Collection, InstructionAccount } from './types';

@Directive({ selector: '[bdEditInstructionDocument]' })
export class EditInstructionDocumentDirective {
  @Input() instructionDocument: InstructionAccountDto | null = null;
  @Input() collections: List<Collection> | null = null;
  @Input() instructionAccounts: List<InstructionAccount> | null = null;
  @Output() editInstructionDocument = new EventEmitter<InstructionAccountDto>();
  @HostListener('click') onClick(): void {
    if (!this.collections || !this.instructionAccounts) {
      return;
    }

    this._matDialog
      .open<
        EditInstructionDocumentComponent,
        {
          document: InstructionAccountDto | null;
          collections: List<Collection>;
          accounts: List<InstructionAccount>;
        },
        InstructionAccountDto
      >(EditInstructionDocumentComponent, {
        data: {
          document: this.instructionDocument,
          collections: this.collections,
          accounts: this.instructionAccounts,
        },
        panelClass: ['bd-bg-wood', 'bg-bd-brown'],
      })
      .afterClosed()
      .subscribe((data) => data && this.editInstructionDocument.emit(data));
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
