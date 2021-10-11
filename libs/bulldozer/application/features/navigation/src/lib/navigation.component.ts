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
            <figure class="pt-4 pb-4 w-full flex justify-center bg-white">
              <img src="assets/images/logo.png" class="w-4/6" />
            </figure>
            <h2 class="mt-4 text-center">BULLDOZER</h2>
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
          <mat-nav-list togglePosition="afer">
            <div class="w-full mb-6 flex justify-center items-center">
              <bd-download-code [template]="rustCode$ | async">
                Download code
                <mat-icon>file_download</mat-icon>
              </bd-download-code>
            </div>
          </mat-nav-list>
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
        <mat-toolbar color="primary" class="shadow-xl sticky top-0 z-10">
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="drawer.toggle()"
            *ngIf="isHandset$ | async"
          >
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>
          <wallet-multi-button
            class="ml-auto bd-custom-color"
            color="accent"
          ></wallet-multi-button>
          <div class="ml-6">
            <bd-dark-theme-switch></bd-dark-theme-switch>
          </div>
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
  readonly applications$ = this._navigationStore.applications$;
  readonly application$ = this._applicationStore.application$;
  readonly collections$ = this._collectionStore.collections$;
  readonly instructions$ = this._instructionStore.instructions$;
  readonly rustCode$ = this._applicationStore.rustCode$;

  constructor(
    private readonly _navigationStore: NavigationStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _instructionStore: InstructionStore
  ) {}

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
