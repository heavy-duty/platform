import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WalletAdapterUiModule } from '@heavy-duty/wallet-adapter-ui';

import { UnauthorizedAccessComponent } from './unauthorized-access.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: UnauthorizedAccessComponent },
    ]),
    WalletAdapterUiModule,
  ],
  declarations: [UnauthorizedAccessComponent],
  exports: [UnauthorizedAccessComponent],
})
export class UnauthorizedAccessModule {}
