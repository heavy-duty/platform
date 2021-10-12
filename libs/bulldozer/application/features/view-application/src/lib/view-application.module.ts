import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

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
  ],
  declarations: [ViewApplicationComponent],
})
export class ViewApplicationModule {}
