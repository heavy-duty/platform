import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApplicationStore } from '@bulldozer-client/applications-data-access';
import { ViewApplicationStore } from './view-application.store';

@Component({
  selector: 'bd-view-application',
  template: `
    <div *ngIf="application$ | ngrxPush as application" class="p-5">
      <header bdPageHeader>
        <h1>
          {{ application.name }}
        </h1>
        <p>Visualize all the details about this application.</p>
      </header>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ViewApplicationStore, ApplicationStore],
})
export class ViewApplicationComponent {
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
