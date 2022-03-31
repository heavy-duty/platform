import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
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
    ClipboardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    ReactiveComponentModule,
    CollaboratorsListModule,
  ],
  declarations: [ViewWorkspaceCollaboratorsComponent],
})
export class ViewWorkspaceCollaboratorsModule {}
