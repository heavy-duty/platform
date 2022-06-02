import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StopPropagationDirective } from './stop-propagation.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [StopPropagationDirective],
  exports: [StopPropagationDirective],
})
export class StopPropagationModule {}
