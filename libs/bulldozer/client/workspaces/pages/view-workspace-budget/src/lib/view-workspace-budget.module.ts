import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BudgetDetailsModule } from '@bulldozer-client/budget-details';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewWorkspaceBudgetComponent } from './view-workspace-budget.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ViewWorkspaceBudgetComponent },
    ]),
    ReactiveComponentModule,
    BudgetDetailsModule,
  ],
  declarations: [ViewWorkspaceBudgetComponent],
})
export class ViewWorkspaceBudgetModule {}
