import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

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
            path: 'workspaces',
            loadChildren: () =>
              import('@heavy-duty/bulldozer/application/shell').then(
                (m) => m.ApplicationShellModule
              ),
          },
          {
            path: 'unauthorized-access',
            loadChildren: () =>
              import('@heavy-duty/bulldozer/features/unauthorized-access').then(
                (m) => m.UnauthorizedAccessModule
              ),
          },
          {
            path: '**',
            redirectTo: 'workspaces',
          },
        ],
      },
    ]),
  ],
})
export class ShellModule {}
