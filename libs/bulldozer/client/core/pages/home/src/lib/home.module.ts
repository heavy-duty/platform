import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EditUserModule } from '@bulldozer-client/edit-user';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { ReactiveComponentModule } from '@ngrx/component';
import { HomeComponent } from './home.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: HomeComponent },
    ]),
    ReactiveComponentModule,
    HdWalletAdapterCdkModule,
    EditUserModule,
  ],
  declarations: [HomeComponent],
})
export class HomeModule {}
