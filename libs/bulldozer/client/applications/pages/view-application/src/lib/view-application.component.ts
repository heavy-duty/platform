import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { ApplicationStore } from '@bulldozer-client/applications-data-access';
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
  providers: [ViewApplicationStore, ApplicationStore],
})
export class ViewApplicationComponent {
  @HostBinding('class') class = 'block p-4';
  readonly application$ = this._applicationStore.application$;

  constructor(
    private readonly _applicationStore: ApplicationStore,
    private readonly _viewApplicationStore: ViewApplicationStore
  ) {
    this._applicationStore.setApplicationId(
      this._viewApplicationStore.applicationId$
    );
  }
}
