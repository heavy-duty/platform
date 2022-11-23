import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CardModule } from '@bulldozer-client/bd-card';
import { DepositToBudgetModule } from '@bulldozer-client/deposit-to-budget';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { WithdrawFromBudgetModule } from '@bulldozer-client/withdraw-from-budget';
import { ProgressSpinnerModule } from '@heavy-duty/ui/progress-spinner';
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
    ProgressSpinnerModule,
    ReactiveComponentModule,
    DepositToBudgetModule,
    WithdrawFromBudgetModule,
    HdWalletAdapterCdkModule,
    ItemUpdatingModule,
    CardModule,
  ],
  declarations: [FromLamportsPipe, ViewWorkspaceBudgetComponent],
})
export class ViewWorkspaceBudgetModule {}
