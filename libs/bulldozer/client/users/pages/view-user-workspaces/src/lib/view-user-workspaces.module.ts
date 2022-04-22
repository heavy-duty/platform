import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CardModule } from '@bulldozer-client/bd-card';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewUserWorkspacesComponent } from './view-user-workspaces.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ViewUserWorkspacesComponent,
      },
    ]),
    ClipboardModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveComponentModule,
    ItemUpdatingModule,
    ObscureAddressModule,
    HdWalletAdapterCdkModule,
    CardModule,
  ],
  declarations: [ViewUserWorkspacesComponent],
})
export class ViewUserWorkspacesModule {}
