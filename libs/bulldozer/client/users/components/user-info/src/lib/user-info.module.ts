import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MyWorkspacesListModule } from '@bulldozer-client/my-workspaces-list';
import { UserDetailsModule } from '@bulldozer-client/user-details';
import { ReactiveComponentModule } from '@ngrx/component';
import { UserInfoComponent } from './user-info.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: UserInfoComponent,
      },
    ]),
    MatIconModule,
    ReactiveComponentModule,
    MyWorkspacesListModule,
    UserDetailsModule,
  ],
  declarations: [UserInfoComponent],
})
export class UserInfoModule {}
