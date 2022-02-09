import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { ApplicationTabComponent } from './application-tab.component';

@NgModule({
  declarations: [ApplicationTabComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    ReactiveComponentModule,
  ],
  exports: [ApplicationTabComponent],
})
export class ApplicationTabModule {}
