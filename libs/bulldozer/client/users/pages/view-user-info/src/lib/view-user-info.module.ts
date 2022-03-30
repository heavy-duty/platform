import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MyWorkspacesListModule } from '@bulldozer-client/my-workspaces-list';
import { UserDetailsModule } from '@bulldozer-client/user-details';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewUserInfoComponent } from './view-user-info.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ViewUserInfoComponent,
      },
    ]),
    MatIconModule,
    ReactiveComponentModule,
    MyWorkspacesListModule,
    UserDetailsModule,
  ],
  declarations: [ViewUserInfoComponent],
})
export class ViewUserInfoModule {}
