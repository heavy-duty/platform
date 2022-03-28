import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BudgetDetailsModule } from '@bulldozer-client/budget-details';
import { CollaboratorsListModule } from '@bulldozer-client/collaborators-list';
import { WorkspaceInstructionsModule } from '@bulldozer-client/workspace-instructions';
import { ReactiveComponentModule } from '@ngrx/component';
import { WorkspaceDetailsExplorerBudgetComponent } from './workspace-details-explorer-budget.component';
import { WorkspaceDetailsExplorerCollaboratorsComponent } from './workspace-details-explorer-collaborators.component';
import { WorkspaceDetailsExplorerInstructionsComponent } from './workspace-details-explorer-instructions.component';
import { WorkspaceDetailsExplorerComponent } from './workspace-details-explorer.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: WorkspaceDetailsExplorerComponent,
        children: [
          {
            path: 'budget',
            component: WorkspaceDetailsExplorerBudgetComponent,
          },
          {
            path: 'collaborators',
            component: WorkspaceDetailsExplorerCollaboratorsComponent,
          },
          {
            path: 'instructions',
            component: WorkspaceDetailsExplorerInstructionsComponent,
          },
          {
            path: '**',
            redirectTo: 'budget',
          },
        ],
      },
    ]),
    BudgetDetailsModule,
    ReactiveComponentModule,
    CollaboratorsListModule,
    WorkspaceInstructionsModule,
  ],
  declarations: [
    WorkspaceDetailsExplorerComponent,
    WorkspaceDetailsExplorerBudgetComponent,
    WorkspaceDetailsExplorerCollaboratorsComponent,
    WorkspaceDetailsExplorerInstructionsComponent,
  ],
})
export class WorkspaceDetailsExplorerModule {}
