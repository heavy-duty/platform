import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
import { ReactiveComponentModule } from '@ngrx/component';
import { EditInstructionMintComponent } from './edit-instruction-mint.component';
import { EditInstructionMintDirective } from './edit-instruction-mint.directive';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatDialogModule,
		MatFormFieldModule,
		MatIconModule,
		MatInputModule,
		ReactiveComponentModule,
		ObscureAddressModule,
	],
	declarations: [EditInstructionMintComponent, EditInstructionMintDirective],
	exports: [EditInstructionMintDirective],
})
export class EditInstructionMintModule {}
