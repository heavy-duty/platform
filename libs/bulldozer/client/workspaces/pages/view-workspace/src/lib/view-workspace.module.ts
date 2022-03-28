import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { BudgetDetailsModule } from '@bulldozer-client/budget-details';
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
            path: '',
            loadChildren: () =>
              import(
                '@heavy-duty/bulldozer/client/workspaces/components/workspace-details-explorer'
              ).then((m) => m.WorkspaceDetailsExplorerModule),
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
    BudgetDetailsModule,
    CollaboratorsListModule,
    WorkspaceInstructionsModule,
    ItemUpdatingModule,
  ],
})
export class ViewWorkspaceModule {}
