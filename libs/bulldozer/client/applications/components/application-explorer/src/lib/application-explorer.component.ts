import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ApplicationApiService } from '@bulldozer-client/applications-data-access';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { PublicKey } from '@solana/web3.js';
import { ApplicationExplorerStore } from './application-explorer.store';

@Component({
  selector: 'bd-application-explorer',
  template: `
    <button
      mat-raised-button
      color="primary"
      class="block mx-auto mb-4"
      [disabled]="!connected"
      aria-label="Create application"
      bdEditApplicationTrigger
      (editApplication)="onCreateApplication($event)"
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
          [connected]="connected"
          [applicationId]="application.id"
        >
        </bd-collection-explorer>

        <bd-instruction-explorer
          [connected]="connected"
          [applicationId]="application.id"
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
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ApplicationExplorerStore],
})
export class ApplicationExplorerComponent {
  @Input() connected = false;
  @Input() workspaceId: string | null = null;
  @Input() walletPublicKey: PublicKey | null = null;
  readonly applications$ = this._applicationExplorerStore.applications$;

  constructor(
    private readonly _applicationExplorerStore: ApplicationExplorerStore,
    private readonly _applicationApiService: ApplicationApiService
  ) {}

  onCreateApplication(name: string) {
    if (!this.workspaceId) {
      throw Error('WorkspaceId is missing.');
    }

    if (!this.walletPublicKey) {
      throw Error('Wallet Public Key is missing.');
    }

    this._applicationApiService
      .create({
        applicationName: name,
        authority: this.walletPublicKey.toBase58(),
        workspaceId: this.workspaceId,
      })
      .subscribe();
  }

  onUpdateApplication(applicationId: string, applicationName: string) {
    if (!this.walletPublicKey) {
      throw Error('Wallet Public Key is missing.');
    }

    this._applicationApiService
      .update({
        applicationId,
        applicationName,
        authority: this.walletPublicKey.toBase58(),
      })
      .subscribe();
  }

  onDeleteApplication(applicationId: string) {
    if (!this.workspaceId) {
      throw Error('WorkspaceId is missing.');
    }

    if (!this.walletPublicKey) {
      throw Error('Wallet Public Key is missing.');
    }

    this._applicationApiService
      .delete({
        applicationId,
        authority: this.walletPublicKey.toBase58(),
        workspaceId: this.workspaceId,
      })
      .subscribe();
  }

  identify(_: number, document: Document<Application>) {
    return document.id;
  }
}
