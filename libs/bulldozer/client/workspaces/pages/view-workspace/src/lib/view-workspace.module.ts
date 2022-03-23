import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { BudgetDetailsModule } from '@bulldozer-client/budget-details';
import { CollaboratorsListModule } from '@bulldozer-client/collaborators-list';
import { PageHeaderModule } from '@bulldozer-client/page-header';
import { WorkspaceInstructionsModule } from '@bulldozer-client/workspace-instructions';
import { WorkspaceTransactionsModule } from '@bulldozer-client/workspace-transactions';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewWorkspaceComponent } from './view-workspace.component';

@NgModule({
  declarations: [ViewWorkspaceComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ViewWorkspaceComponent },
    ]),
    MatButtonModule,
    ReactiveComponentModule,
    PageHeaderModule,
    BudgetDetailsModule,
    CollaboratorsListModule,
    WorkspaceTransactionsModule,
    WorkspaceInstructionsModule
  ],
})
export class ViewWorkspaceModule {}
