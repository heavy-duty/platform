import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConnectionStore, WalletStore } from '@danmt/wallet-adapter-angular';
import { ProgramStore } from '@heavy-duty/bulldozer/data-access';
import { NavigationModule } from '@heavy-duty/bulldozer/features/navigation';

import { ShellComponent } from './shell.component';

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
            path: 'applications',
            loadChildren: () =>
              import('@heavy-duty/bulldozer/application/shell').then(
                (m) => m.ApplicationShellModule
              ),
          },
          {
            path: '**',
            redirectTo: 'applications',
          },
        ],
      },
    ]),
    NavigationModule,
  ],
  providers: [ProgramStore, ConnectionStore, WalletStore],
})
export class ShellModule {}
