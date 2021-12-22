import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import {
  ApplicationStore,
  CollectionStore,
  InstructionStore,
  WorkspaceStore,
} from '@heavy-duty/bulldozer/application/data-access';
import {
  Application,
  Collection,
  Instruction,
  Workspace,
} from '@heavy-duty/bulldozer/application/utils/types';

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
              <button
                *ngIf="application$ | ngrxPush"
                mat-button
                color="accent"
                (click)="onDownload()"
              >
                Download code
              </button>
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

          <ng-container *ngrxLet="workspace$; let selectedWorkspace">
            <button
              class="ml-auto"
              type="button"
              mat-raised-button
              [matMenuTriggerFor]="menu"
            >
              {{
                selectedWorkspace === null
                  ? 'Select workspace'
                  : selectedWorkspace.data.name
              }}
            </button>
            <mat-menu id="workspace-menu" #menu="matMenu" class="px-4 py-2">
              <mat-list role="list" class="p-0">
                <mat-list-item
                  *ngFor="let workspace of workspaces$ | ngrxPush"
                  role="listitem"
                  class="w-60 h-auto bg-black bg-opacity-10 mb-2 pt-4 pb-3 border-b-4 border-transparent"
                  [ngClass]="{
                    'border-b-primary': selectedWorkspace?.id === workspace.id
                  }"
                >
                  <div>
                    <p class="text-xl font-bold mb-0">
                      {{ workspace.data.name }}
                    </p>

                    <p class="mb-2">
                      <a
                        class="text-xs"
                        [routerLink]="['/workspaces', workspace.id]"
                        [ngClass]="{
                          'underline text-primary':
                            selectedWorkspace?.id !== workspace.id,
                          'opacity-50 italic':
                            selectedWorkspace?.id === workspace.id
                        }"
                      >
                        {{
                          selectedWorkspace?.id === workspace.id
                            ? 'Active'
                            : 'Activate'
                        }}
                      </a>
                    </p>

                    <div>
                      <button
                        class="mr-2"
                        type="button"
                        mat-raised-button
                        color="primary"
                        (click)="onUpdateWorkspace(workspace)"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        mat-raised-button
                        color="primary"
                        (click)="onDeleteWorkspace(workspace.id)"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </mat-list-item>
              </mat-list>

              <button
                class="w-full h-12"
                type="button"
                mat-raised-button
                color="primary"
                (click)="onCreateWorkspace()"
              >
                New workspace
              </button>
            </mat-menu>
          </ng-container>

          <hd-wallet-multi-button
            class="bd-custom-color ml-6 h-auto leading-none"
            color="accent"
          ></hd-wallet-multi-button>
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

      #workspace-menu .mat-menu-content {
        padding: 0 !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NavigationStore],
})
export class NavigationComponent {
  @Output() downloadCode = new EventEmitter();
  readonly isHandset$ = this._navigationStore.isHandset$;
  readonly connected$ = this._navigationStore.connected$;
  readonly address$ = this._navigationStore.address$;
  readonly workspace$ = this._workspaceStore.workspace$;
  readonly workspaces$ = this._workspaceStore.workspaces$;
  readonly applications$ = this._applicationStore.applications$;
  readonly application$ = this._applicationStore.application$;
  readonly collections$ = this._collectionStore.activeCollections$;
  readonly instructions$ = this._instructionStore.activeInstructions$;

  constructor(
    private readonly _navigationStore: NavigationStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _instructionStore: InstructionStore
  ) {}

  onCreateWorkspace() {
    this._workspaceStore.createWorkspace();
  }

  onUpdateWorkspace(workspace: Workspace) {
    this._workspaceStore.updateWorkspace(workspace);
  }

  onDeleteWorkspace(workspaceId: string) {
    this._workspaceStore.deleteWorkspace(workspaceId);
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

  onDownload() {
    this.downloadCode.emit();
  }
}
