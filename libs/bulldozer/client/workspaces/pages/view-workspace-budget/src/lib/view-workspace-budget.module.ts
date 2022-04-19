import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { DepositToBudgetModule } from '@bulldozer-client/deposit-to-budget';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { WithdrawFromBudgetModule } from '@bulldozer-client/withdraw-from-budget';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { ReactiveComponentModule } from '@ngrx/component';
import { FromLamportsPipe } from './from-lamports.pipe';
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
    MatProgressSpinnerModule,
    ReactiveComponentModule,
    DepositToBudgetModule,
    WithdrawFromBudgetModule,
    HdWalletAdapterCdkModule,
    ItemUpdatingModule,
  ],
  declarations: [FromLamportsPipe, ViewWorkspaceBudgetComponent],
})
export class ViewWorkspaceBudgetModule {}
