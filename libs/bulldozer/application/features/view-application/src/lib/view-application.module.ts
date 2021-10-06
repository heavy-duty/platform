import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';

import { ViewApplicationComponent } from './view-application.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ViewApplicationComponent,
        children: [
          {
            path: 'collections/:collectionId',
            loadChildren: () =>
              import(
                '@heavy-duty/bulldozer/application/features/view-collection'
              ).then((m) => m.ViewCollectionModule),
          },
          {
            path: 'instructions/:instructionId',
            loadChildren: () =>
              import(
                '@heavy-duty/bulldozer/application/features/view-instruction'
              ).then((m) => m.ViewInstructionModule),
          },
        ],
      },
    ]),
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    ReactiveComponentModule,
  ],
  declarations: [ViewApplicationComponent],
})
export class ViewApplicationModule {}
