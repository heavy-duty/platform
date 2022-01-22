import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ShellComponent } from './shell.component';

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
  ],
})
export class ShellModule {}
