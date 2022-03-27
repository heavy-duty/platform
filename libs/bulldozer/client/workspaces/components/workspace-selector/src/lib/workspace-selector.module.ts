import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { EditWorkspaceComponentModule } from '@bulldozer-client/edit-workspace';
import { ImportWorkspaceComponentModule } from '@bulldozer-client/import-workspace';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { StopPropagationModule } from '@bulldozer-client/stop-propagation';
import { ReactiveComponentModule } from '@ngrx/component';
import { WorkspaceSelectorComponent } from './workspace-selector.component';

@NgModule({
  declarations: [WorkspaceSelectorComponent],
  exports: [WorkspaceSelectorComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveComponentModule,
    StopPropagationModule,
    EditWorkspaceComponentModule,
    ImportWorkspaceComponentModule,
    ItemUpdatingModule,
  ],
})
export class WorkspaceSelectorModule {}
