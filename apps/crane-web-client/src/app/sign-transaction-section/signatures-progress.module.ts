import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SignaturesProgressComponent } from './signatures-progress.component';

@NgModule({
  imports: [CommonModule, MatProgressBarModule],
  exports: [SignaturesProgressComponent],
  declarations: [SignaturesProgressComponent],
})
export class SignaturesProgressModule {}
