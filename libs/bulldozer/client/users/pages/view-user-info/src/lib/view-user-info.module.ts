import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CardModule } from '@bulldozer-client/bd-card';
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
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveComponentModule,
    EditUserModule,
    ItemUpdatingModule,
    ObscureAddressModule,
    HdWalletAdapterCdkModule,
    CardModule,
  ],
  declarations: [ViewUserInfoComponent],
})
export class ViewUserInfoModule {}
