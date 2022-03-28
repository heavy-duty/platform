import { Component } from '@angular/core';
import { UserStore } from '@bulldozer-client/users-data-access';
import {
  WorkspaceQueryStore,
  WorkspacesStore,
  WorkspaceStore,
} from '@bulldozer-client/workspaces-data-access';
import { UserExplorerStore } from './user-explorer.store';

@Component({
  selector: 'bd-user-explorer',
  template: ` <router-outlet></router-outlet>`,
  styles: [],
  providers: [
    WorkspacesStore,
    WorkspaceQueryStore,
    UserStore,
    UserExplorerStore,
    WorkspaceStore,
  ],
})
export class UserExplorerComponent {}
