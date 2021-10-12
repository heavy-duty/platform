import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { NavigationModule } from '@heavy-duty/bulldozer/application/features/navigation';
import { ReactiveComponentModule } from '@ngrx/component';

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
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTabsModule,
    ReactiveComponentModule,
    NavigationModule,
  ],
  declarations: [ApplicationShellComponent],
  exports: [ApplicationShellComponent],
})
export class ApplicationShellModule {}
