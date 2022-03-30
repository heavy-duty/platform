import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CollaboratorsListModule } from '@bulldozer-client/collaborators-list';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewWorkspaceCollaboratorsComponent } from './view-workspace-collaborators.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: ViewWorkspaceCollaboratorsComponent,
      },
    ]),
    ReactiveComponentModule,
    CollaboratorsListModule,
  ],
  declarations: [ViewWorkspaceCollaboratorsComponent],
})
export class ViewWorkspaceCollaboratorsModule {}
