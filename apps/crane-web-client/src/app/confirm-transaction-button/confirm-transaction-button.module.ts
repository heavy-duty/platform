import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmTransactionButtonComponent } from './confirm-transaction-button.component';

@NgModule({
	imports: [CommonModule, MatButtonModule],
	exports: [ConfirmTransactionButtonComponent],
	declarations: [ConfirmTransactionButtonComponent],
})
export class ConfirmTransactionButtonModule {}
