import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { ObscureAddressModule } from '@heavy-duty/bulldozer/application/utils/pipes/obscure-address';
import { EditInstructionDocumentTriggerDirective } from './edit-instruction-document-trigger.directive';
import { EditInstructionDocumentComponent } from './edit-instruction-document.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    ObscureAddressModule,
  ],
  declarations: [
    EditInstructionDocumentComponent,
    EditInstructionDocumentTriggerDirective,
  ],
  exports: [EditInstructionDocumentTriggerDirective],
})
export class EditInstructionDocumentModule {}
