import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { WorkspaceTabComponent } from './workspace-tab.component';

@NgModule({
  declarations: [WorkspaceTabComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    ReactiveComponentModule,
  ],
  exports: [WorkspaceTabComponent],
})
export class WorkspaceTabModule {}
