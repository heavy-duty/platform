import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '@bulldozer-client/auth-guard';
import { DarkThemeDirectiveModule } from '@bulldozer-client/dark-theme';
import { DarkThemeSwitchModule } from '@bulldozer-client/dark-theme-switch';
import { TabListModule } from '@bulldozer-client/tab-list';
import { UserInstructionsModule } from '@bulldozer-client/user-instructions';
import { WorkspaceExplorerModule } from '@bulldozer-client/workspace-explorer';
import { HdSolanaCdkModule } from '@heavy-duty/ngx-solana-cdk';
import { HdSolanaMaterialModule } from '@heavy-duty/ngx-solana-material';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
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
          {
            path: 'profile',
            loadChildren: () =>
              import('@bulldozer-client/view-profile').then(
                (m) => m.ViewProfileModule
              ),
          },
          {
            path: '',
            loadChildren: () =>
              import('@bulldozer-client/home').then((m) => m.HomeModule),
          },
        ],
      },
      {
        path: '**',
        redirectTo: 'workspaces',
      },
    ]),
    ClipboardModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatSnackBarModule,
    ReactiveComponentModule,
    HdWalletAdapterMaterialModule,
    HdWalletAdapterCdkModule,
    HdSolanaMaterialModule,
    HdSolanaCdkModule,
    DarkThemeDirectiveModule,
    DarkThemeSwitchModule,
    WorkspaceExplorerModule,
    TabListModule,
    UserInstructionsModule,
  ],
  providers: [AuthGuard],
})
export class ShellModule {}
