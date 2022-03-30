import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WorkspaceInstructionsModule } from '@bulldozer-client/workspace-instructions';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewWorkspaceInstructionsComponent } from './view-workspace-instructions.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: ViewWorkspaceInstructionsComponent,
      },
    ]),
    ReactiveComponentModule,
    WorkspaceInstructionsModule,
  ],
  declarations: [ViewWorkspaceInstructionsComponent],
})
export class ViewWorkspaceInstructionsModule {}
