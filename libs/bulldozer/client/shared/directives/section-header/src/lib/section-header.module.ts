import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SectionHeaderDirective } from './section-header.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [SectionHeaderDirective],
  exports: [SectionHeaderDirective],
})
export class SectionHeaderModule {}
