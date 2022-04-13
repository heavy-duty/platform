import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { EditUserModule } from '@bulldozer-client/edit-user';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewUserInfoComponent } from './view-user-info.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ViewUserInfoComponent,
      },
    ]),
    ClipboardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveComponentModule,
    EditUserModule,
    ItemUpdatingModule,
    ObscureAddressModule,
    HdWalletAdapterCdkModule,
  ],
  declarations: [ViewUserInfoComponent],
})
export class ViewUserInfoModule {}
