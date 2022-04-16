import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApplicationStore } from '@bulldozer-client/applications-data-access';
import { map } from 'rxjs';
import { ViewApplicationStore } from './view-application.store';

@Component({
  selector: 'bd-view-application',
  template: `
    <div *ngIf="application$ | ngrxPush as application" class="p-5">
      <header bdPageHeader>
        <h1>
          <!-- <span
            [matTooltip]="
              application.document.name
                | bdItemUpdatingMessage: application:'Application'
            "
            matTooltipShowDelay="500"
            class="flex items-center justify-start gap-2"
          >
            {{ application.document.name }}
            <mat-progress-spinner
              *ngIf="application | bdItemShowSpinner"
              diameter="16"
              mode="indeterminate"
            ></mat-progress-spinner>
          </span> -->
        </h1>
        <p>Visualize all the details about this application.</p>
      </header>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ViewApplicationStore, ApplicationStore],
})
export class ViewApplicationComponent implements OnInit {
  readonly application$ = this._applicationStore.application$;

  constructor(
    private readonly _applicationStore: ApplicationStore,
    private readonly _viewApplicationStore: ViewApplicationStore,
    private readonly _route: ActivatedRoute
  ) {}

  ngOnInit() {
    this._viewApplicationStore.setWorkspaceId(
      this._route.paramMap.pipe(map((paramMap) => paramMap.get('workspaceId')))
    );
    this._viewApplicationStore.setApplicationId(
      this._route.paramMap.pipe(
        map((paramMap) => paramMap.get('applicationId'))
      )
    );
  }
}
