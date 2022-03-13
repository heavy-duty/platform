import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HdBroadcasterDirective } from './broadcaster.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [HdBroadcasterDirective],
  exports: [HdBroadcasterDirective],
})
export class HdBroadcasterCdkModule {}
