import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Application } from '@heavy-duty/bulldozer/data-access';

@Component({
  selector: 'bd-application-selector',
  template: `
    <mat-expansion-panel class="flex-shrink-0" togglePosition="before">
      <mat-expansion-panel-header>
        <div class="flex justify-between items-center flex-grow">
          <mat-panel-title>
            <ng-container *ngIf="application; else noApplicationSelected">
              {{ application.data.name }}
            </ng-container>
            <ng-template #noApplicationSelected>Applications</ng-template>
          </mat-panel-title>
          <button
            mat-icon-button
            [disabled]="connected === false"
            aria-label="Create application"
            (click)="onCreateApplication($event)"
          >
            <mat-icon>add</mat-icon>
          </button>
        </div>
      </mat-expansion-panel-header>
      <mat-nav-list dense>
        <mat-list-item *ngFor="let application of applications">
          <a matLine [routerLink]="['/applications', application.id]">
            {{ application.data.name }}
          </a>

          <button
            mat-icon-button
            [attr.aria-label]="
              'More options of ' + application.data.name + ' application'
            "
            [matMenuTriggerFor]="applicationOptionsMenu"
          >
            <mat-icon>more_horiz</mat-icon>
          </button>
          <mat-menu #applicationOptionsMenu="matMenu">
            <button
              mat-menu-item
              (click)="onEditApplication(application)"
              [disabled]="connected === false"
            >
              <mat-icon>edit</mat-icon>
              <span>Edit application</span>
            </button>
            <button
              mat-menu-item
              (click)="onDeleteApplication(application.id)"
              [disabled]="connected === false"
            >
              <mat-icon>delete</mat-icon>
              <span>Delete application</span>
            </button>
          </mat-menu>
        </mat-list-item>
      </mat-nav-list>
    </mat-expansion-panel>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationSelectorComponent {
  @Input() connected: boolean | null = null;
  @Input() application: Application | null = null;
  @Input() applications: Application[] | null = null;
  @Output() createApplication = new EventEmitter();
  @Output() updateApplication = new EventEmitter<Application>();
  @Output() deleteApplication = new EventEmitter<string>();

  onCreateApplication(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.createApplication.emit();
  }

  onEditApplication(application: Application) {
    this.updateApplication.emit(application);
  }

  onDeleteApplication(applicationId: string) {
    this.deleteApplication.emit(applicationId);
  }
}
