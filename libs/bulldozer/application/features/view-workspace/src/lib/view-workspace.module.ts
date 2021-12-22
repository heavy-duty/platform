import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewWorkspaceComponent } from './view-workspace.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ViewWorkspaceComponent,
        children: [
          {
            path: 'applications/:applicationId',
            loadChildren: () =>
              import(
                '@heavy-duty/bulldozer/application/features/view-application'
              ).then((m) => m.ViewApplicationModule),
          },
        ],
      },
    ]),
  ],
  declarations: [ViewWorkspaceComponent],
  exports: [ViewWorkspaceComponent],
})
export class ViewWorkspaceModule {}
