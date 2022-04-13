import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewProfileTabComponent } from './view-profile-tab.component';

@NgModule({
  declarations: [ViewProfileTabComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    ReactiveComponentModule,
  ],
  exports: [ViewProfileTabComponent],
})
export class ViewProfileTabModule {}
