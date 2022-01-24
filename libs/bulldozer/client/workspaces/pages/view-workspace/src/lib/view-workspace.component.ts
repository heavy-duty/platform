import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
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
  providers: [ViewWorkspaceStore],
})
export class ViewWorkspaceComponent {
  @HostBinding('class') class = 'block p-4';
  readonly workspace$ = this._viewWorkspaceStore.workspace$;

  constructor(private readonly _viewWorkspaceStore: ViewWorkspaceStore) {}
}
