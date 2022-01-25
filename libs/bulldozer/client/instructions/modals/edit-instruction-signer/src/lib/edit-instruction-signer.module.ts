import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { EditInstructionSignerTriggerDirective } from './edit-instruction-signer-trigger.directive';
import { EditInstructionSignerComponent } from './edit-instruction-signer.component';

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
    EditInstructionSignerTriggerDirective,
  ],
  exports: [EditInstructionSignerTriggerDirective],
})
export class EditInstructionSignerModule {}
