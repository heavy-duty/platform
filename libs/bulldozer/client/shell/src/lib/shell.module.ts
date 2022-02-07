import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { ApplicationTabModule } from '@bulldozer-client/application-tab';
import { AuthGuard } from '@bulldozer-client/auth-guard';
import { CollectionTabModule } from '@bulldozer-client/collection-tab';
import { DarkThemeDirectiveModule } from '@bulldozer-client/dark-theme';
import { DarkThemeSwitchModule } from '@bulldozer-client/dark-theme-switch';
import { InstructionTabModule } from '@bulldozer-client/instruction-tab';
import { StopPropagationModule } from '@bulldozer-client/stop-propagation';
import { WorkspaceExplorerModule } from '@bulldozer-client/workspace-explorer';
import { WorkspaceSelectorModule } from '@bulldozer-client/workspace-selector';
import { WorkspaceTabModule } from '@bulldozer-client/workspace-tab';
import { HdWalletAdapterMaterialModule } from '@heavy-duty/wallet-adapter-material';
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
    MatTabsModule,
    MatToolbarModule,
    ReactiveComponentModule,
    HdWalletAdapterMaterialModule,
    StopPropagationModule,
    DarkThemeDirectiveModule,
    DarkThemeSwitchModule,
    WorkspaceExplorerModule,
    WorkspaceSelectorModule,
    WorkspaceTabModule,
    ApplicationTabModule,
    CollectionTabModule,
    InstructionTabModule,
  ],
  providers: [AuthGuard],
})
export class ShellModule {}
