import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { ApplicationExplorerStore } from './application-explorer.store';

@Component({
  selector: 'bd-application-explorer',
  template: `
    <button
      mat-raised-button
      color="primary"
      class="block mx-auto mb-4"
      [disabled]="(connected$ | ngrxPush) === false"
      aria-label="Create application"
      (click)="onCreateApplication()"
    >
      Create application
    </button>

    <ng-container *ngrxLet="applications$; let applications">
      <mat-expansion-panel
        *ngFor="let application of applications; trackBy: identify"
        class="flex-shrink-0"
        togglePosition="before"
      >
        <mat-expansion-panel-header class="pl-4 pr-0">
          <div class="flex justify-between items-center flex-grow">
            <mat-panel-title> {{ application.name }} </mat-panel-title>
            <button
              mat-icon-button
              [attr.aria-label]="
                'More options of ' + application.name + ' application'
              "
              [matMenuTriggerFor]="applicationOptionsMenu"
              bdStopPropagation
            >
              <mat-icon>more_horiz</mat-icon>
            </button>
          </div>
        </mat-expansion-panel-header>

        <bd-collection-explorer
          [applicationId]="application.id"
          [connected]="(connected$ | ngrxPush) ?? false"
        >
        </bd-collection-explorer>

        <bd-instruction-explorer
          [applicationId]="application.id"
          [connected]="(connected$ | ngrxPush) ?? false"
        >
        </bd-instruction-explorer>

        <mat-menu #applicationOptionsMenu="matMenu">
          <a
            mat-menu-item
            [routerLink]="[
              '/workspaces',
              application.data.workspace,
              'applications',
              application.id
            ]"
          >
            <mat-icon>launch</mat-icon>
            <span>View application</span>
          </a>
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
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ApplicationExplorerStore],
})
export class ApplicationExplorerComponent {
  readonly connected$ = this._applicationExplorerStore.connected$;
  readonly applications$ = this._applicationExplorerStore.applications$;

  constructor(
    private readonly _applicationExplorerStore: ApplicationExplorerStore
  ) {}

  onCreateApplication() {
    this._applicationExplorerStore.createApplication();
  }

  onEditApplication(application: Document<Application>) {
    this._applicationExplorerStore.updateApplication(application);
  }

  onDeleteApplication(application: Document<Application>) {
    this._applicationExplorerStore.deleteApplication(application);
  }

  identify(_: number, document: Document<Application>) {
    return document.id;
  }
}
