import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConnectionStore, WalletStore } from '@danmt/wallet-adapter-angular';
import { NavigationModule } from '@heavy-duty/bulldozer/application/features/navigation';

import { ShellComponent } from './shell.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: ShellComponent }]),
    NavigationModule,
  ],
  declarations: [ShellComponent],
  exports: [ShellComponent],
  providers: [WalletStore, ConnectionStore],
})
export class ShellModule {}
