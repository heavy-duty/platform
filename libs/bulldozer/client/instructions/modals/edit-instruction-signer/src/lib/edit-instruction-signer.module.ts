import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { EditInstructionSignerComponent } from './edit-instruction-signer.component';
import { EditInstructionSignerDirective } from './edit-instruction-signer.directive';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  declarations: [
    EditInstructionSignerComponent,
    EditInstructionSignerDirective,
  ],
  exports: [EditInstructionSignerDirective],
})
export class EditInstructionSignerModule {}
