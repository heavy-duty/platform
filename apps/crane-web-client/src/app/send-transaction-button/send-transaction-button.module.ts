import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SendTransactionButtonComponent } from './send-transaction-button.component';

@NgModule({
  imports: [CommonModule],
  exports: [SendTransactionButtonComponent],
  declarations: [SendTransactionButtonComponent],
})
export class SendTransactionButtonModule {}
