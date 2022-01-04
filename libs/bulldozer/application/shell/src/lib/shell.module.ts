import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { DarkThemeSwitchModule } from '@heavy-duty/bulldozer/application/ui/components/dark-theme';
import { DarkThemeDirectivesModule } from '@heavy-duty/bulldozer/application/ui/directives/dark-theme';
import { AuthGuard } from '@heavy-duty/bulldozer/application/utils/guards/auth';
import { WalletAdapterUiModule } from '@heavy-duty/wallet-adapter-ui';
import { ReactiveComponentModule } from '@ngrx/component';
import { ApplicationSelectorComponent } from './application-selector.component';
import { CollectionSelectorComponent } from './collection-selector.component';
import { InstructionSelectorComponent } from './instruction-selector.component';
import { ShellComponent } from './shell.component';
import { WorkspaceSelectorComponent } from './workspace-selector.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ShellComponent,
        children: [
          {
            path: 'workspaces/:workspaceId',
            loadChildren: () =>
              import(
                '@heavy-duty/bulldozer/application/features/view-workspace'
              ).then((m) => m.ViewWorkspaceModule),
          },
          {
            path: 'workspaces/:workspaceId/applications/:applicationId',
            loadChildren: () =>
              import(
                '@heavy-duty/bulldozer/application/features/view-application'
              ).then((m) => m.ViewApplicationModule),
          },
          {
            path: 'workspaces/:workspaceId/applications/:applicationId/collections/:collectionId',
            loadChildren: () =>
              import(
                '@heavy-duty/bulldozer/application/features/view-collection'
              ).then((m) => m.ViewCollectionModule),
          },
          {
            path: 'workspaces/:workspaceId/applications/:applicationId/instructions/:instructionId',
            loadChildren: () =>
              import(
                '@heavy-duty/bulldozer/application/features/view-instruction'
              ).then((m) => m.ViewInstructionModule),
          },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: 'unauthorized-access',
        loadChildren: () =>
          import(
            '@heavy-duty/bulldozer/application/features/unauthorized-access'
          ).then((m) => m.UnauthorizedAccessModule),
      },
      {
        path: '**',
        redirectTo: 'workspaces',
      },
    ]),
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveComponentModule,
    WalletAdapterUiModule,
    DarkThemeDirectivesModule,
    DarkThemeSwitchModule,
  ],
  declarations: [
    ShellComponent,
    WorkspaceSelectorComponent,
    ApplicationSelectorComponent,
    CollectionSelectorComponent,
    InstructionSelectorComponent,
  ],
  exports: [ShellComponent],
  providers: [AuthGuard],
})
export class ShellModule {}
