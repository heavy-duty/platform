import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
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
