import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '@bulldozer-client/auth-guard';
import { DarkThemeDirectiveModule } from '@bulldozer-client/dark-theme';
import { DarkThemeSwitchModule } from '@bulldozer-client/dark-theme-switch';
import { WorkspaceExplorerModule } from '@bulldozer-client/workspace-explorer';
import { WorkspaceSelectorModule } from '@bulldozer-client/workspace-selector';
import { WalletAdapterUiModule } from '@heavy-duty/wallet-adapter-ui';
import { ReactiveComponentModule } from '@ngrx/component';
import { ShellComponent } from './shell.component';

@NgModule({
  declarations: [ShellComponent],
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
              import('@bulldozer-client/view-workspace').then(
                (m) => m.ViewWorkspaceModule
              ),
          },
          {
            path: 'workspaces/:workspaceId/applications/:applicationId',
            loadChildren: () =>
              import('@bulldozer-client/view-application').then(
                (m) => m.ViewApplicationModule
              ),
          },
          {
            path: 'workspaces/:workspaceId/applications/:applicationId/collections/:collectionId',
            loadChildren: () =>
              import('@bulldozer-client/view-collection').then(
                (m) => m.ViewCollectionModule
              ),
          },
          {
            path: 'workspaces/:workspaceId/applications/:applicationId/instructions/:instructionId',
            loadChildren: () =>
              import('@bulldozer-client/view-instruction').then(
                (m) => m.ViewInstructionModule
              ),
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
    MatIconModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatToolbarModule,
    ReactiveComponentModule,
    WalletAdapterUiModule,
    DarkThemeDirectiveModule,
    DarkThemeSwitchModule,
    WorkspaceExplorerModule,
    WorkspaceSelectorModule,
  ],
})
export class ShellModule {}
