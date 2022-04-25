import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
import { EditInstructionRelationComponent } from './edit-instruction-relation.component';
import { EditInstructionRelationDirective } from './edit-instruction-relation.directive';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ObscureAddressModule,
  ],
  declarations: [
    EditInstructionRelationComponent,
    EditInstructionRelationDirective,
  ],
  exports: [EditInstructionRelationDirective],
})
export class EditInstructionRelationModule {}
