import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { NavigationModule } from '@heavy-duty/bulldozer/application/features/navigation';

import { ApplicationShellComponent } from './shell.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ApplicationShellComponent,
        children: [
          {
            path: ':applicationId',
            loadChildren: () =>
              import(
                '@heavy-duty/bulldozer/application/features/view-application'
              ).then((m) => m.ViewApplicationModule),
          },
        ],
      },
    ]),
    MatSelectModule,
    MatSnackBarModule,
    NavigationModule,
  ],
  declarations: [ApplicationShellComponent],
  exports: [ApplicationShellComponent],
})
export class ApplicationShellModule {}
