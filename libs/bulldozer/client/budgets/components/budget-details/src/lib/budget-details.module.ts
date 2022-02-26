import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DepositToBudgetComponentModule } from '@bulldozer-client/deposit-to-budget';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
import { SectionHeaderModule } from '@bulldozer-client/section-header';
import { HdWalletAdapterMaterialModule } from '@heavy-duty/wallet-adapter-material';
import { BudgetDetailsComponent } from './budget-details.component';

@NgModule({
  declarations: [BudgetDetailsComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    HdWalletAdapterMaterialModule,
    SectionHeaderModule,
    ObscureAddressModule,
    DepositToBudgetComponentModule,
  ],
  exports: [BudgetDetailsComponent],
})
export class BudgetDetailsModule {}
