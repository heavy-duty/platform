import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ShellComponent } from './shell.component';
import { AuthGuard } from '@heavy-duty/bulldozer/utils/guards/auth';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';

@NgModule({
  declarations: [ShellComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ShellComponent,
        children: [
          {
            path: 'workspaces',
            loadChildren: () =>
              import('@heavy-duty/bulldozer/application/shell').then(
                (m) => m.ApplicationShellModule
              ),
            canActivate: [AuthGuard],
          },
          {
            path: 'unauthorized-access',
            loadChildren: () =>
              import('@heavy-duty/bulldozer/features/unauthorized-access').then(
                (m) => m.UnauthorizedAccessModule
              ),
          },
          {
            path: '**',
            redirectTo: 'workspaces',
          },
        ],
      },
    ]),
  ],
  providers: [ConnectionStore, WalletStore, AuthGuard],
})
export class ShellModule {}
