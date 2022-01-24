import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { NavigationModule } from '@heavy-duty/bulldozer/application/features/navigation';
import { AuthGuard } from '@heavy-duty/bulldozer/application/utils/guards/auth';
import { ReactiveComponentModule } from '@ngrx/component';
import { ShellComponent } from './shell.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: 'workspaces',
        component: ShellComponent,
        children: [
          {
            path: ':workspaceId',
            loadChildren: () =>
              import(
                '@heavy-duty/bulldozer/application/features/view-workspace'
              ).then((m) => m.ViewWorkspaceModule),
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
    MatSelectModule,
    MatSnackBarModule,
    MatTabsModule,
    ReactiveComponentModule,
    NavigationModule,
  ],
  declarations: [ShellComponent],
  exports: [ShellComponent],
  providers: [AuthGuard],
})
export class ShellModule {}
