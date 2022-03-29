import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  ApplicationQueryStore,
  ApplicationsStore,
  ApplicationView,
} from '@bulldozer-client/applications-data-access';
import { ApplicationExplorerStore } from './application-explorer.store';

@Component({
  selector: 'bd-application-explorer',
  template: `
    <ng-container *ngrxLet="applications$; let applications">
      <div class="overflow-y-auto">
        <mat-expansion-panel
          *ngFor="let application of applications; trackBy: identify"
          class="flex-shrink-0"
          togglePosition="before"
        >
          <mat-expansion-panel-header class="pl-4 pr-0">
            <div class="flex justify-between items-center flex-grow">
              <mat-panel-title
                [matTooltip]="
                  application.document.name
                    | bdItemUpdatingMessage: application:'Application'
                "
                matTooltipShowDelay="500"
                class="w-28 flex justify-between gap-2 items-center flex-grow m-0"
              >
                <span
                  class="flex-grow font-bold text-left overflow-hidden whitespace-nowrap overflow-ellipsis"
                >
                  {{ application.document.name }}
                </span>
                <mat-progress-spinner
                  *ngIf="application | bdItemShowSpinner"
                  class="flex-shrink-0"
                  diameter="16"
                  mode="indeterminate"
                ></mat-progress-spinner>
              </mat-panel-title>
              <button
                mat-icon-button
                [attr.aria-label]="
                  'More options of ' +
                  application.document.name +
                  ' application'
                "
                [matMenuTriggerFor]="applicationOptionsMenu"
                bdStopPropagation
              >
                <mat-icon>more_horiz</mat-icon>
              </button>
            </div>
          </mat-expansion-panel-header>

          <bd-collection-explorer
            [connected]="connected"
            [applicationId]="application.document.id"
            [workspaceId]="application.document.data.workspace"
          >
          </bd-collection-explorer>

          <bd-instruction-explorer
            [connected]="connected"
            [applicationId]="application.document.id"
            [workspaceId]="application.document.data.workspace"
          >
          </bd-instruction-explorer>

          <mat-menu #applicationOptionsMenu="matMenu">
            <a
              mat-menu-item
              [routerLink]="[
                '/workspaces',
                application.document.data.workspace,
                'applications',
                application.document.id
              ]"
            >
              <mat-icon>launch</mat-icon>
              <span>View application</span>
            </a>
            <button
              mat-menu-item
              bdEditApplicationTrigger
              [application]="application.document"
              (editApplication)="
                onUpdateApplication(
                  application.document.data.workspace,
                  application.document.id,
                  $event
                )
              "
              [disabled]="!connected"
            >
              <mat-icon>edit</mat-icon>
              <span>Edit application</span>
            </button>
            <button
              mat-menu-item
              (click)="
                onDeleteApplication(
                  application.document.data.workspace,
                  application.document.id
                )
              "
              [disabled]="!connected"
            >
              <mat-icon>delete</mat-icon>
              <span>Delete application</span>
            </button>
          </mat-menu>
        </mat-expansion-panel>
      </div>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ApplicationsStore,
    ApplicationQueryStore,
    ApplicationExplorerStore,
  ],
})
export class ApplicationExplorerComponent {
  @Input() connected = false;

  @Input() set workspaceId(value: string) {
    this._applicationExplorerStore.setWorkspaceId(value);
  }

  readonly workspaceId$ = this._applicationExplorerStore.workspaceId$;
  readonly applications$ = this._applicationsStore.applications$;

  constructor(
    private readonly _applicationsStore: ApplicationsStore,
    private readonly _applicationExplorerStore: ApplicationExplorerStore
  ) {}

  onCreateApplication(workspaceId: string, applicationName: string) {
    this._applicationExplorerStore.createApplication({
      workspaceId,
      applicationName,
    });
  }

  onUpdateApplication(
    workspaceId: string,
    applicationId: string,
    applicationName: string
  ) {
    this._applicationExplorerStore.updateApplication({
      workspaceId,
      applicationId,
      applicationName,
    });
  }

  onDeleteApplication(workspaceId: string, applicationId: string) {
    this._applicationExplorerStore.deleteApplication({
      workspaceId,
      applicationId,
    });
  }

  identify(_: number, application: ApplicationView) {
    return application.document.id;
  }
}
