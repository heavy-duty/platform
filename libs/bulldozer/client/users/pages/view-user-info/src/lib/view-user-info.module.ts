import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { RouterModule } from '@angular/router';
import { CardModule } from '@bulldozer-client/bd-card';
import { EditUserModule } from '@bulldozer-client/edit-user';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
import { ProgressSpinnerModule } from '@heavy-duty/ui/progress-spinner';
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
    ProgressSpinnerModule,
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
