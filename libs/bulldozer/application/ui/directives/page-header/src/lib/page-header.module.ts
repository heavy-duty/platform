import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderDirective } from './page-header.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [PageHeaderDirective],
  exports: [PageHeaderDirective],
})
export class PageHeaderModule {}
