import { Component } from '@angular/core';
import { WorkspaceDetailsExplorerStore } from './workspace-details-explorer.store';

@Component({
  selector: 'bd-workspace-details-explorer',
  template: `<router-outlet></router-outlet>`,
  styles: [],
  providers: [WorkspaceDetailsExplorerStore],
})
export class WorkspaceDetailsExplorerComponent {}
