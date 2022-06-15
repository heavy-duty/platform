import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
import { ReactiveComponentModule } from '@ngrx/component';
import { EditInstructionDocumentComponent } from './edit-instruction-document.component';
import { EditInstructionDocumentDirective } from './edit-instruction-document.directive';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatAutocompleteModule,
		MatButtonModule,
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
		EditInstructionDocumentComponent,
		EditInstructionDocumentDirective,
	],
	exports: [EditInstructionDocumentDirective],
})
export class EditInstructionDocumentModule {}
