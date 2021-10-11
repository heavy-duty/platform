import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { WalletUiModule } from '@danmt/wallet-adapter-angular-material-ui';
import { DarkThemeModule } from '@heavy-duty/bulldozer/application/ui/dark-theme';
import { ObscureAddressModule } from '@heavy-duty/bulldozer/application/utils/pipes/obscure-address';
import { ReactiveComponentModule } from '@ngrx/component';

import { ApplicationSelectorComponent } from './application-selector.component';
import { CollectionSelectorComponent } from './collection-selector.component';
import { InstructionSelectorComponent } from './instruction-selector.component';
import { NavigationComponent } from './navigation.component';

import { CodeFileManagerModule } from '@heavy-duty/code-file-manager';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    LayoutModule,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    ReactiveComponentModule,
    WalletUiModule,
    ObscureAddressModule,
    DarkThemeModule,
    CodeFileManagerModule,
  ],
  declarations: [
    NavigationComponent,
    ApplicationSelectorComponent,
    CollectionSelectorComponent,
    InstructionSelectorComponent,
  ],
  exports: [NavigationComponent],
})
export class NavigationModule {}
