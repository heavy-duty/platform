import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { BudgetDetailsModule } from '@bulldozer-client/budget-details';
import { CollaboratorsListModule } from '@bulldozer-client/collaborators-list';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
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
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveComponentModule,
    PageHeaderModule,
    BudgetDetailsModule,
    CollaboratorsListModule,
    WorkspaceTransactionsModule,
    WorkspaceInstructionsModule,
    ItemUpdatingModule,
  ],
})
export class ViewWorkspaceModule {}
