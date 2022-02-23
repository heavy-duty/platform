import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
import { SectionHeaderModule } from '@bulldozer-client/section-header';
import { HdWalletAdapterMaterialModule } from '@heavy-duty/wallet-adapter-material';
import { UserDetailsComponent } from './user-details.component';

@NgModule({
  declarations: [UserDetailsComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    HdWalletAdapterMaterialModule,
    SectionHeaderModule,
    ObscureAddressModule,
  ],
  exports: [UserDetailsComponent],
})
export class UserDetailsModule {}
