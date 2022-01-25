import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PageHeaderDirective } from './page-header.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [PageHeaderDirective],
  exports: [PageHeaderDirective],
})
export class PageHeaderModule {}
