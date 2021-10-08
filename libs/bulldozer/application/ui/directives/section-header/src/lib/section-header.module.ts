import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeaderDirective } from './section-header.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [SectionHeaderDirective],
  exports: [SectionHeaderDirective],
})
export class SectionHeaderModule {}
