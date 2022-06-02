import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { SendTransactionButtonComponent } from './send-transaction-button.component';

@NgModule({
	imports: [CommonModule, MatButtonModule],
	exports: [SendTransactionButtonComponent],
	declarations: [SendTransactionButtonComponent],
})
export class SendTransactionButtonModule {}
