import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { WorkspaceStore } from '@bulldozer-client/workspaces-data-access';
import { ViewWorkspaceStore } from './view-workspace.store';

@Component({
  selector: 'bd-view-workspace',
  template: `
    <ng-container *ngIf="workspace$ | ngrxPush as workspace">
      <header bdPageHeader>
        <h1>
          {{ workspace.name }}
        </h1>
        <p>Visualize all the details about this workspace.</p>
      </header>

      <main></main>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WorkspaceStore, ViewWorkspaceStore],
})
export class ViewWorkspaceComponent {
  @HostBinding('class') class = 'block p-4';
  readonly workspace$ = this._workspaceStore.workspace$;

  constructor(
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _viewWorkspaceStore: ViewWorkspaceStore
  ) {
    this._workspaceStore.setWorkspaceId(this._viewWorkspaceStore.workspaceId$);
  }
}
