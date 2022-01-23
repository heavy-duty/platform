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
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { DarkThemeSwitchModule } from '@heavy-duty/bulldozer/application/ui/components/dark-theme';
import { DarkThemeDirectivesModule } from '@heavy-duty/bulldozer/application/ui/directives/dark-theme';
import { ObscureAddressModule } from '@heavy-duty/bulldozer/application/utils/pipes/obscure-address';
import { HdWalletAdapterMaterialModule } from '@heavy-duty/wallet-adapter-material';
import { ReactiveComponentModule } from '@ngrx/component';
import { ApplicationSelectorComponent } from './application-selector.component';
import { CollectionSelectorComponent } from './collection-selector.component';
import { InstructionSelectorComponent } from './instruction-selector.component';
import { NavigationComponent } from './navigation.component';
import { WorkspaceSelectorComponent } from './workspace-selector.component';

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
    MatTooltipModule,
    ReactiveComponentModule,
    HdWalletAdapterMaterialModule,
    ObscureAddressModule,
    DarkThemeDirectivesModule,
    DarkThemeSwitchModule,
  ],
  declarations: [
    NavigationComponent,
    WorkspaceSelectorComponent,
    ApplicationSelectorComponent,
    CollectionSelectorComponent,
    InstructionSelectorComponent,
  ],
  exports: [NavigationComponent],
})
export class NavigationModule {}
