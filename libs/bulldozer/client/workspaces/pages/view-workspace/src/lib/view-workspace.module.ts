import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { DepositToBudgetComponentModule } from '@bulldozer-client/deposit-to-budget';
import { PageHeaderModule } from '@bulldozer-client/page-header';
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
    DepositToBudgetComponentModule,
  ],
})
export class ViewWorkspaceModule {}
