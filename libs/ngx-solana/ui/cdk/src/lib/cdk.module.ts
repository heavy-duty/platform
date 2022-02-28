import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HdSolanaConfigDirective } from './config.directive';
import { HdSolanaConnectionDirective } from './connection.directive';
import { HdIsAccountUpdatingDirective } from './is-account-updating.directive';
import { HdRelativeTimePipe } from './relative-time.pipe';
import { HdStopPropagationDirective } from './stop-propagation.directive';
import { HdSolanaTransactionsDirective } from './transactions.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [
    HdSolanaConnectionDirective,
    HdSolanaConfigDirective,
    HdSolanaTransactionsDirective,
    HdRelativeTimePipe,
    HdStopPropagationDirective,
    HdIsAccountUpdatingDirective,
  ],
  exports: [
    HdSolanaConnectionDirective,
    HdSolanaConfigDirective,
    HdSolanaTransactionsDirective,
    HdRelativeTimePipe,
    HdStopPropagationDirective,
    HdIsAccountUpdatingDirective,
  ],
})
export class HdSolanaCdkModule {}
