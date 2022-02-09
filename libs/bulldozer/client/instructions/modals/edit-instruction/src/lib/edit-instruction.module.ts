import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { EditInstructionTriggerDirective } from './edit-instruction-trigger.directive';
import { EditInstructionComponent } from './edit-instruction.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  declarations: [EditInstructionComponent, EditInstructionTriggerDirective],
  exports: [EditInstructionTriggerDirective],
})
export class EditInstructionModule {}
