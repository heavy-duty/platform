import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
import { SectionHeaderModule } from '@bulldozer-client/section-header';
import { HdWalletAdapterMaterialModule } from '@heavy-duty/wallet-adapter-material';
import { UserDetailsComponent } from './user-details.component';

@NgModule({
  declarations: [UserDetailsComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    HdWalletAdapterMaterialModule,
    SectionHeaderModule,
    ObscureAddressModule,
    ItemUpdatingModule,
  ],
  exports: [UserDetailsComponent],
})
export class UserDetailsModule {}
