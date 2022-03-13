import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
import { SectionHeaderModule } from '@bulldozer-client/section-header';
import { WorkspaceTransactionsComponent } from './workspace-transactions.component';

@NgModule({
  declarations: [WorkspaceTransactionsComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    ObscureAddressModule,
    SectionHeaderModule,
  ],
  exports: [WorkspaceTransactionsComponent],
})
export class WorkspaceTransactionsModule {}
