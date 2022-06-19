import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CardModule } from '@bulldozer-client/bd-card';
import { ReactiveComponentModule } from '@ngrx/component';
import { AddInstructionAccountComponent } from './add-instruction-account.component';
import { AddInstructionAccountDirective } from './add-instruction-account.directive';

@NgModule({
	imports: [
		CommonModule,
		MatButtonModule,
		MatDialogModule,
		MatIconModule,
		ReactiveComponentModule,
		CardModule,
	],
	declarations: [
		AddInstructionAccountComponent,
		AddInstructionAccountDirective,
	],
	exports: [AddInstructionAccountDirective],
})
export class AddInstructionAccountModule {}
