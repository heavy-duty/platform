import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { ApplicationExplorerStore } from './application-explorer.store';

@Component({
  selector: 'bd-application-explorer',
  template: `
    <ng-container *ngrxLet="applications$; let applications">
      <mat-expansion-panel
        *ngFor="let application of applications"
        class="flex-shrink-0"
        togglePosition="before"
      >
        <mat-expansion-panel-header>
          <div class="flex justify-between items-center flex-grow">
            <mat-panel-title>
              <a
                matLine
                [routerLink]="[
                  '/workspaces',
                  application.data.workspace,
                  'applications',
                  application.id
                ]"
                [matTooltip]="application.name"
                matTooltipShowDelay="500"
              >
                {{ application.name }}
              </a>

              <button
                mat-icon-button
                [attr.aria-label]="
                  'More options of ' + application.name + ' application'
                "
                [matMenuTriggerFor]="applicationOptionsMenu"
              >
                <mat-icon>more_horiz</mat-icon>
              </button>
            </mat-panel-title>

            <bd-collection-explorer
              [workspaceId]="workspaceId"
              [applicationId]="application.id"
            >
            </bd-collection-explorer>
            <bd-instruction-explorer
              [workspaceId]="workspaceId"
              [applicationId]="application.id"
            >
            </bd-instruction-explorer>
          </div>
        </mat-expansion-panel-header>
        <mat-menu #applicationOptionsMenu="matMenu">
          <button
            mat-menu-item
            (click)="onEditApplication(application)"
            [disabled]="(connected$ | ngrxPush) === false"
          >
            <mat-icon>edit</mat-icon>
            <span>Edit application</span>
          </button>
          <button
            mat-menu-item
            (click)="onDeleteApplication(application)"
            [disabled]="(connected$ | ngrxPush) === false"
          >
            <mat-icon>delete</mat-icon>
            <span>Delete application</span>
          </button>
        </mat-menu>
      </mat-expansion-panel>
    </ng-container>

    <button
      mat-icon-button
      [disabled]="(connected$ | ngrxPush) === false"
      aria-label="Create application"
      (click)="onCreateApplication($event)"
    >
      Create application
    </button>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ApplicationExplorerStore],
})
export class ApplicationExplorerComponent {
  @Input() workspaceId?: string;
  readonly connected$ = this._applicationExplorerStore.connected$;
  readonly applications$ = this._applicationExplorerStore.applications$;

  constructor(
    public readonly _applicationExplorerStore: ApplicationExplorerStore
  ) {}

  onCreateApplication(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    if (!this.workspaceId) {
      return;
    }

    this._applicationExplorerStore.createApplication(this.workspaceId);
  }

  onEditApplication(application: Document<Application>) {
    this._applicationExplorerStore.updateApplication(application);
  }

  onDeleteApplication(application: Document<Application>) {
    this._applicationExplorerStore.deleteApplication(application);
  }
}
