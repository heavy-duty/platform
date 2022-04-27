import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProgressSpinnerDirective } from './progress-spinner.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [ProgressSpinnerDirective],
  exports: [ProgressSpinnerDirective],
})
export class ProgressSpinnerModule {}
