import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MyWorkspacesListModule } from '@bulldozer-client/my-workspaces-list';
import { UserDetailsModule } from '@bulldozer-client/user-details';
import { ReactiveComponentModule } from '@ngrx/component';
import { UserExplorerInfoComponent } from './user-explorer-info.component';
import { UserExplorerWorkspacesComponent } from './user-explorer-workspaces.component';
import { UserExplorerComponent } from './user-explorer.component';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: UserExplorerComponent,
        children: [
          {
            path: 'user-info',
            component: UserExplorerInfoComponent,
          },
          {
            path: 'workspaces',
            component: UserExplorerWorkspacesComponent,
          },
          {
            path: '',
            redirectTo: 'user-info',
          },
        ],
      },
    ]),
    MyWorkspacesListModule,
    ReactiveComponentModule,
    UserDetailsModule,
  ],
  declarations: [
    UserExplorerComponent,
    UserExplorerInfoComponent,
    UserExplorerWorkspacesComponent,
  ],
  exports: [
    UserExplorerComponent,
    UserExplorerInfoComponent,
    UserExplorerWorkspacesComponent,
  ],
})
export class UserExplorerModule {}
