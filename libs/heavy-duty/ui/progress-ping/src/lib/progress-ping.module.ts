import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProgressPingComponent } from './progress-ping.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ProgressPingComponent],
  exports: [ProgressPingComponent],
})
export class ProgressPingModule {}
