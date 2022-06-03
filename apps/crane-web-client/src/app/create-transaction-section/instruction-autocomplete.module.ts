import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ScrewedCardModule } from '../components/screwed-card.module';
import { InstructionAutocompleteComponent } from './instruction-autocomplete.component';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatAutocompleteModule,
		MatFormFieldModule,
		MatInputModule,
		ScrewedCardModule,
	],
	exports: [InstructionAutocompleteComponent],
	declarations: [InstructionAutocompleteComponent],
	providers: [],
})
export class InstructionAutocompleteModule {}
