import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ApplicationsStore } from '@bulldozer-client/applications-data-access';
import { ConfigStore } from '@bulldozer-client/core-data-access';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';

@Component({
  selector: 'bd-application-explorer',
  template: `
    <ng-container *ngrxLet="applications$; let applications">
      <div class="flex flex-col items-center pb-3 bd-custom-background">
        <button
          mat-raised-button
          color="primary"
          class="block"
          [disabled]="!connected"
          bdEditApplicationTrigger
          (editApplication)="onCreateApplication($event)"
        >
          Create application
        </button>
      </div>
      <div class="overflow-y-auto">
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
            [connected]="connected"
            [applicationId]="application.id"
            [workspaceId]="workspaceId"
          >
          </bd-collection-explorer>

          <bd-instruction-explorer
            [connected]="connected"
            [applicationId]="application.id"
            [workspaceId]="workspaceId"
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
              bdEditApplicationTrigger
              [application]="application"
              (editApplication)="onUpdateApplication(application.id, $event)"
              [disabled]="!connected"
            >
              <mat-icon>edit</mat-icon>
              <span>Edit application</span>
            </button>
            <button
              mat-menu-item
              (click)="onDeleteApplication(application.id)"
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
  providers: [ApplicationsStore],
})
export class ApplicationExplorerComponent {
  @Input() connected = false;

  private _workspaceId!: string;
  get workspaceId() {
    return this._workspaceId;
  }
  @Input() set workspaceId(value: string) {
    this._workspaceId = value;
    this._applicationsStore.setFilters({
      workspace: value,
    });
  }

  readonly applications$ = this._applicationsStore.applications$;
  readonly connected$ = this._walletStore.connected$;
  readonly workspaceIds$ = this._configStore.workspaceIds$;

  constructor(
    private readonly _applicationsStore: ApplicationsStore,
    private readonly _configStore: ConfigStore,
    private readonly _walletStore: WalletStore
  ) {}

  onCreateApplication(applicationName: string) {
    this._applicationsStore.createApplication({
      workspaceId: this.workspaceId,
      applicationName,
    });
  }

  onUpdateApplication(applicationId: string, applicationName: string) {
    this._applicationsStore.updateApplication({
      applicationId,
      applicationName,
    });
  }

  onDeleteApplication(applicationId: string) {
    this._applicationsStore.deleteApplication({
      workspaceId: this.workspaceId,
      applicationId,
    });
  }

  identify(_: number, document: Document<Application>) {
    return document.id;
  }
}
