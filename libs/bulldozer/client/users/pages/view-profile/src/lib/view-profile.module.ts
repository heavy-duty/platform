import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
import { PageHeaderModule } from '@bulldozer-client/page-header';
import { HdWalletAdapterMaterialModule } from '@heavy-duty/wallet-adapter-material';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewProfileComponent } from './view-profile.component';

@NgModule({
  declarations: [ViewProfileComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ViewProfileComponent,
        pathMatch: 'full',
      },
    ]),
    MatButtonModule,
    ReactiveComponentModule,
    HdWalletAdapterMaterialModule,
    PageHeaderModule,
    ObscureAddressModule,
  ],
})
export class ViewProfileModule {}
