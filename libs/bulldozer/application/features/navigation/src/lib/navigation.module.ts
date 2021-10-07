import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { WalletUiModule } from '@danmt/wallet-adapter-angular-material-ui';
import { DarkThemeModule } from '@heavy-duty/bulldozer/application/ui/dark-theme';
import { ObscureAddressModule } from '@heavy-duty/bulldozer/application/utils/pipes/obscure-address';
import { CodeEditorSettingsModule } from '@heavy-duty/bulldozer/application/utils/services/code-editor-settings';
import { ReactiveComponentModule } from '@ngrx/component';
import { MonacoEditorModule } from 'ngx-monaco-editor';

import { ApplicationSelectorComponent } from './application-selector.component';
import { CollectionSelectorComponent } from './collection-selector.component';
import { InstructionSelectorComponent } from './instruction-selector.component';
import { NavigationComponent } from './navigation.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    LayoutModule,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatTabsModule,
    MatSidenavModule,
    MatToolbarModule,
    ReactiveComponentModule,
    WalletUiModule,
    ObscureAddressModule,
    DarkThemeModule,
    CodeEditorSettingsModule,
    FormsModule,
    MonacoEditorModule.forRoot(),
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
