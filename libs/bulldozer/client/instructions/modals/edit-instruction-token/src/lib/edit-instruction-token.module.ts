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
import { ReactiveComponentModule } from '@ngrx/component';
import { EditInstructionTokenComponent } from './edit-instruction-token.component';
import { EditInstructionTokenDirective } from './edit-instruction-token.directive';

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
		ReactiveComponentModule,
		ObscureAddressModule,
	],
	declarations: [EditInstructionTokenComponent, EditInstructionTokenDirective],
	exports: [EditInstructionTokenDirective],
})
export class EditInstructionTokenModule {}
