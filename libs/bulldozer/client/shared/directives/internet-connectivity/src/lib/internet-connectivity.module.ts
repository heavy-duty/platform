import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InternetConnectivityDirective } from './internet-connectivity.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [InternetConnectivityDirective],
  exports: [InternetConnectivityDirective],
})
export class InternetConnectivityModule {}
