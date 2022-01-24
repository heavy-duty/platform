import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HdWalletAdapterMaterialModule } from '@heavy-duty/wallet-adapter-material';
import { UnauthorizedAccessComponent } from './unauthorized-access.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: UnauthorizedAccessComponent },
    ]),
    HdWalletAdapterMaterialModule,
  ],
  declarations: [UnauthorizedAccessComponent],
  exports: [UnauthorizedAccessComponent],
})
export class UnauthorizedAccessModule {}
