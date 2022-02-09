import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { InstructionTabComponent } from './instruction-tab.component';

@NgModule({
  declarations: [InstructionTabComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    ReactiveComponentModule,
  ],
  exports: [InstructionTabComponent],
})
export class InstructionTabModule {}
