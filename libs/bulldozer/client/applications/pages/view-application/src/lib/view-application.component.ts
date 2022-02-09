import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { ViewApplicationRouteStore } from './view-application-route.store';
import { ViewApplicationStore } from './view-application.store';

@Component({
  selector: 'bd-view-application',
  template: `
    <ng-container *ngIf="application$ | ngrxPush as application">
      <header bdPageHeader>
        <h1>
          {{ application.name }}
        </h1>
        <p>Visualize all the details about this application.</p>
      </header>

      <main></main>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ViewApplicationStore, ViewApplicationRouteStore],
})
export class ViewApplicationComponent {
  @HostBinding('class') class = 'block p-4';
  readonly application$ = this._viewApplicationStore.application$;

  constructor(private readonly _viewApplicationStore: ViewApplicationStore) {}
}
