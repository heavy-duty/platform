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
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
import { EditInstructionDocumentComponent } from './edit-instruction-document.component';
import { EditInstructionDocumentDirective } from './edit-instruction-document.directive';

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
    EditInstructionDocumentDirective,
  ],
  exports: [EditInstructionDocumentDirective],
})
export class EditInstructionDocumentModule {}
