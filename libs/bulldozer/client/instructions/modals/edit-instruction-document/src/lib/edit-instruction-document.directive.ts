import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {} from '@bulldozer-client/collections-data-access';
import { InstructionAccountItemView } from '@bulldozer-client/instructions-data-access';
import {
  Document,
  InstructionAccount,
  InstructionAccountDto,
} from '@heavy-duty/bulldozer-devkit';
import { EditInstructionDocumentComponent } from './edit-instruction-document.component';

@Directive({ selector: '[bdEditInstructionDocument]' })
export class EditInstructionDocumentDirective {
  @Input() instructionDocument: Document<InstructionAccount> | null = null;
  @Input() collections: any[] | null = null;
  @Input() instructionAccounts: InstructionAccountItemView[] | null = null;
  @Output() editInstructionDocument = new EventEmitter<InstructionAccountDto>();
  @HostListener('click') onClick(): void {
    if (!this.collections || !this.instructionAccounts) {
      return;
    }

    this._matDialog
      .open<
        EditInstructionDocumentComponent,
        {
          document: Document<InstructionAccount> | null;
          collections: any[];
          accounts: InstructionAccountItemView[];
        },
        InstructionAccountDto
      >(EditInstructionDocumentComponent, {
        data: {
          document: this.instructionDocument,
          collections: this.collections,
          accounts: this.instructionAccounts,
        },
        panelClass: 'bd-bg-image-7',
      })
      .afterClosed()
      .subscribe((data) => data && this.editInstructionDocument.emit(data));
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
