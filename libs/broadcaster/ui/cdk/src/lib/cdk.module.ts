import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HdBroadcasterStatusDirective } from './broadcaster-status.directive';
import { HdBroadcasterDirective } from './broadcaster.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [HdBroadcasterDirective, HdBroadcasterStatusDirective],
  exports: [HdBroadcasterDirective, HdBroadcasterStatusDirective],
})
export class HdBroadcasterCdkModule {}
