import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ApplicationStore,
  CollectionStore,
  InstructionStore,
} from '@heavy-duty/bulldozer/application/data-access';
import {
  Application,
  Collection,
  Instruction,
} from '@heavy-duty/bulldozer/data-access';

import { NavigationStore } from './navigation.store';

@Component({
  selector: 'bd-navigation',
  template: `
    <mat-sidenav-container class="h-full" fullscreen>
      <mat-sidenav
        #drawer
        class="sidenav"
        fixedInViewport
        [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="(isHandset$ | async) === false"
      >
        <div class="h-full flex flex-col">
          <div class="flex-grow overflow-auto">
            <figure class="mt-4 w-full flex justify-center">
              <img src="assets/images/logo.png" class="w-4/6" />
            </figure>

            <mat-accordion
              *ngIf="application$ | ngrxPush"
              displayMode="flat"
              togglePosition="before"
              multi
            >
              <bd-collection-selector
                [connected]="connected$ | ngrxPush"
                [collections]="collections$ | ngrxPush"
                (createCollection)="onCreateCollection()"
                (updateCollection)="onUpdateCollection($event)"
                (deleteCollection)="onDeleteCollection($event)"
              ></bd-collection-selector>
              <bd-instruction-selector
                [connected]="connected$ | ngrxPush"
                [instructions]="instructions$ | ngrxPush"
                (createInstruction)="onCreateInstruction()"
                (updateInstruction)="onUpdateInstruction($event)"
                (deleteInstruction)="onDeleteInstruction($event)"
              ></bd-instruction-selector>
            </mat-accordion>
          </div>

          <bd-application-selector
            [connected]="connected$ | ngrxPush"
            [application]="application$ | ngrxPush"
            [applications]="applications$ | ngrxPush"
            (createApplication)="onCreateApplication()"
            (updateApplication)="onUpdateApplication($event)"
            (deleteApplication)="onDeleteApplication($event)"
          ></bd-application-selector>
        </div>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="drawer.toggle()"
            *ngIf="isHandset$ | async"
          >
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>
          <ng-container *ngrxLet="connected$; let connected">
            <div *ngIf="!connected" class="ml-auto">
              <button mat-raised-button color="accent" (click)="onConnect()">
                Connect
              </button>
            </div>

            <div *ngIf="connected" class="ml-auto flex items-center">
              <ng-container *ngIf="address$ | ngrxPush as address">
                {{ address | obscureAddress }}
              </ng-container>
              <button
                mat-raised-button
                color="warn"
                class="ml-4"
                (click)="onDisconnect()"
              >
                Disconnect
              </button>
            </div>
          </ng-container>
        </mat-toolbar>
        <ng-content></ng-content>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .sidenav {
        width: 200px;
      }

      .sidenav .mat-toolbar {
        background: inherit;
      }

      .mat-toolbar.mat-primary {
        position: sticky;
        top: 0;
        z-index: 1;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NavigationStore],
})
export class NavigationComponent {
  readonly isHandset$ = this._navigationStore.isHandset$;
  readonly connected$ = this._navigationStore.connected$;
  readonly address$ = this._navigationStore.address$;
  readonly wallets$ = this._navigationStore.wallets$;
  readonly applications$ = this._navigationStore.applications$;
  readonly application$ = this._applicationStore.application$;
  readonly collections$ = this._collectionStore.collections$;
  readonly instructions$ = this._instructionStore.instructions$;

  constructor(
    private readonly _navigationStore: NavigationStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _instructionStore: InstructionStore
  ) {}

  onConnect() {
    this._navigationStore.connectWallet();
  }

  onDisconnect() {
    this._navigationStore.disconnectWallet();
  }

  onCreateApplication() {
    this._applicationStore.createApplication();
  }

  onUpdateApplication(application: Application) {
    this._applicationStore.updateApplication(application);
  }

  onDeleteApplication(applicationId: string) {
    this._applicationStore.deleteApplication(applicationId);
  }

  onCreateCollection() {
    this._collectionStore.createCollection();
  }

  onUpdateCollection(collection: Collection) {
    this._collectionStore.updateCollection(collection);
  }

  onDeleteCollection(collectionId: string) {
    this._collectionStore.deleteCollection(collectionId);
  }

  onCreateInstruction() {
    this._instructionStore.createInstruction();
  }

  onUpdateInstruction(instruction: Instruction) {
    this._instructionStore.updateInstruction(instruction);
  }

  onDeleteInstruction(instructionId: string) {
    this._instructionStore.deleteInstruction(instructionId);
  }
}
