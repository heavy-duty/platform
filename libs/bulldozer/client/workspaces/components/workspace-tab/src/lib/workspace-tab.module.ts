import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { ReactiveComponentModule } from '@ngrx/component';
import { WorkspaceTabComponent } from './workspace-tab.component';

@NgModule({
  declarations: [WorkspaceTabComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    ReactiveComponentModule,
    ItemUpdatingModule,
  ],
  exports: [WorkspaceTabComponent],
})
export class WorkspaceTabModule {}
