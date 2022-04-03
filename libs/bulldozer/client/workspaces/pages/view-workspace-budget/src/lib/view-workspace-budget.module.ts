import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { DepositToBudgetModule } from '@bulldozer-client/deposit-to-budget';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewWorkspaceBudgetComponent } from './view-workspace-budget.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ViewWorkspaceBudgetComponent },
    ]),
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    ReactiveComponentModule,
    DepositToBudgetModule,
  ],
  declarations: [ViewWorkspaceBudgetComponent],
})
export class ViewWorkspaceBudgetModule {}
