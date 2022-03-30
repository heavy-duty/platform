import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
import { PageHeaderModule } from '@bulldozer-client/page-header';
import { UserDetailsModule } from '@bulldozer-client/user-details';
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
        children: [
          {
            path: 'info',
            loadChildren: () =>
              import('@bulldozer-client/user-info').then(
                (m) => m.UserInfoModule
              ),
          },
          {
            path: 'workspaces',
            loadChildren: () =>
              import('@bulldozer-client/user-workspaces').then(
                (m) => m.UserWorkspacesModule
              ),
          },
          {
            path: '',
            redirectTo: 'info',
          },
        ],
      },
    ]),
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    ReactiveComponentModule,
    HdWalletAdapterMaterialModule,
    PageHeaderModule,
    ObscureAddressModule,
    UserDetailsModule,
  ],
})
export class ViewProfileModule {}
