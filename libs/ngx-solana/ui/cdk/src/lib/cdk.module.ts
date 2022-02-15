import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxSolanaConfigDirective } from './config.directive';
import { NgxSolanaConnectionDirective } from './connection.directive';
import { NgxRelativeTimePipe } from './relative-time.pipe';
import { NgxStopPropagationDirective } from './stop-propagation.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [
    NgxSolanaConnectionDirective,
    NgxSolanaConfigDirective,
    NgxRelativeTimePipe,
    NgxStopPropagationDirective,
  ],
  exports: [
    NgxSolanaConnectionDirective,
    NgxSolanaConfigDirective,
    NgxRelativeTimePipe,
    NgxStopPropagationDirective,
  ],
})
export class NgxSolanaCdkModule {}
