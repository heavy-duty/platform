import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MyWorkspacesListModule } from '@bulldozer-client/my-workspaces-list';
import { UserDetailsModule } from '@bulldozer-client/user-details';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewUserWorkspacesComponent } from './view-user-workspaces.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ViewUserWorkspacesComponent,
      },
    ]),
    MyWorkspacesListModule,
    ReactiveComponentModule,
    UserDetailsModule,
  ],
  declarations: [ViewUserWorkspacesComponent],
})
export class ViewUserWorkspacesModule {}
