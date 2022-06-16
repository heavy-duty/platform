import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
import { ReactiveComponentModule } from '@ngrx/component';
import { EditInstructionDocumentDerivationComponent } from './edit-instruction-document-derivation.component';
import { EditInstructionDocumentDerivationDirective } from './edit-instruction-document-derivation.directive';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		DragDropModule,
		MatAutocompleteModule,
		MatButtonModule,
		MatCheckboxModule,
		MatDialogModule,
		MatFormFieldModule,
		MatIconModule,
		MatInputModule,
		MatRadioModule,
		MatSelectModule,
		ReactiveComponentModule,
		ObscureAddressModule,
	],
	declarations: [
		EditInstructionDocumentDerivationComponent,
		EditInstructionDocumentDerivationDirective,
	],
	exports: [EditInstructionDocumentDerivationDirective],
})
export class EditInstructionDocumentDerivationModule {}
