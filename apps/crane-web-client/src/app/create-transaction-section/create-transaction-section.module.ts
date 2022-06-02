import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { ReactiveComponentModule } from '@ngrx/component';
import { FormlyModule } from '@ngx-formly/core';
import { ScrewedCardModule } from '../components/screwed-card.module';
import { RotateModule } from '../directives/rotate.module';
import { StopPropagationModule } from '../directives/stop-propagation.module';
import { CreateTransactionSectionComponent } from './create-transaction-section.component';
import { FormlyFieldStepperComponent } from './formly-stepper.type';
import { InstructionAutocompleteModule } from './instruction-autocomplete.module';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		DragDropModule,
		MatAutocompleteModule,
		MatButtonModule,
		MatFormFieldModule,
		MatIconModule,
		MatInputModule,
		MatStepperModule,
		ReactiveComponentModule,
		FormlyModule.forChild({
			types: [
				{
					name: 'stepper',
					component: FormlyFieldStepperComponent,
				},
			],
		}),
		InstructionAutocompleteModule,
		StopPropagationModule,
		RotateModule,
		ScrewedCardModule,
	],
	exports: [CreateTransactionSectionComponent],
	declarations: [
		CreateTransactionSectionComponent,
		FormlyFieldStepperComponent,
	],
})
export class CreateTransactionSectionModule {}
