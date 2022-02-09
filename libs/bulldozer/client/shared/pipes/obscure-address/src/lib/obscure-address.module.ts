import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObscureAddressPipe } from './obscure-address.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [ObscureAddressPipe],
  exports: [ObscureAddressPipe],
})
export class ObscureAddressModule {}
