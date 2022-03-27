import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { MyWorkspacesListModule } from '@bulldozer-client/my-workspaces-list';
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
            path: '',
            loadChildren: () =>
              import(
                '@heavy-duty/bulldozer/client/users/components/user-explorer'
              ).then((m) => m.UserExplorerModule),
          },
        ],
      },
      {
        path: '**',
        redirectTo: 'explorer',
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
    MyWorkspacesListModule,
  ],
})
export class ViewProfileModule {}
