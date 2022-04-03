import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CollaboratorsListModule } from '@bulldozer-client/collaborators-list';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { PageHeaderModule } from '@bulldozer-client/page-header';
import { WorkspaceInstructionsModule } from '@bulldozer-client/workspace-instructions';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewWorkspaceComponent } from './view-workspace.component';

@NgModule({
  declarations: [ViewWorkspaceComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ViewWorkspaceComponent,
        children: [
          {
            path: 'budget',
            loadChildren: () =>
              import('@bulldozer-client/view-workspace-budget').then(
                (m) => m.ViewWorkspaceBudgetModule
              ),
          },
          {
            path: 'collaborators',
            loadChildren: () =>
              import('@bulldozer-client/view-workspace-collaborators').then(
                (m) => m.ViewWorkspaceCollaboratorsModule
              ),
          },
          {
            path: 'instructions',
            loadChildren: () =>
              import('@bulldozer-client/view-workspace-instructions').then(
                (m) => m.ViewWorkspaceInstructionsModule
              ),
          },
          {
            path: '',
            redirectTo: 'budget',
          },
        ],
      },
    ]),
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSidenavModule,
    MatListModule,
    ReactiveComponentModule,
    PageHeaderModule,
    CollaboratorsListModule,
    WorkspaceInstructionsModule,
    ItemUpdatingModule,
  ],
})
export class ViewWorkspaceModule {}
