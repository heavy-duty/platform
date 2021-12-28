import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  Application,
  Collection,
  Document,
  Instruction,
  Workspace,
} from '@heavy-duty/bulldozer-devkit';
import {
  ApplicationStore,
  CollectionStore,
  InstructionStore,
  WorkspaceStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { NavigationStore } from './navigation.store';

@Component({
  selector: 'bd-navigation',
  template: `
    <mat-sidenav-container class="h-full" fullscreen>
      <mat-sidenav
        #drawer
        class="w-52"
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
              *ngIf="application$ | ngrxPush as application"
              displayMode="flat"
              togglePosition="before"
              multi
            >
              <bd-collection-selector
                [connected]="connected$ | ngrxPush"
                [collections]="collections$ | ngrxPush"
                (createCollection)="
                  onCreateCollection(application.data.workspace, application.id)
                "
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
            *ngIf="workspace$ | ngrxPush as workspace"
            [connected]="connected$ | ngrxPush"
            [application]="application$ | ngrxPush"
            [applications]="applications$ | ngrxPush"
            (createApplication)="onCreateApplication(workspace.id)"
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

          <div class="ml-auto flex items-center">
            <bd-workspace-selector
              class="mr-6"
              [activeWorkspace]="workspace$ | ngrxPush"
              [workspaces]="workspaces$ | ngrxPush"
              (createWorkspace)="onCreateWorkspace()"
              (updateWorkspace)="onUpdateWorkspace($event)"
              (deleteWorkspace)="onDeleteWorkspace($event)"
              (downloadWorkspace)="onDownloadWorkspace($event)"
            ></bd-workspace-selector>

            <hd-wallet-multi-button
              class="bd-custom-color mr-6 h-auto leading-none"
              color="accent"
            ></hd-wallet-multi-button>

            <bd-dark-theme-switch></bd-dark-theme-switch>
          </div>
        </mat-toolbar>

        <ng-content></ng-content>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NavigationStore],
})
export class NavigationComponent {
  readonly isHandset$ = this._navigationStore.isHandset$;
  readonly connected$ = this._navigationStore.connected$;
  readonly address$ = this._navigationStore.address$;
  readonly workspace$ = this._workspaceStore.workspace$;
  readonly workspaces$ = this._workspaceStore.workspaces$;
  readonly applications$ = this._applicationStore.applications$;
  readonly application$ = this._applicationStore.application$;
  readonly collections$ = this._collectionStore.collections$;
  readonly instructions$ = this._instructionStore.instructions$;

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

  onUpdateWorkspace(workspace: Document<Workspace>) {
    this._workspaceStore.updateWorkspace(workspace);
  }

  onDeleteWorkspace(workspace: Document<Workspace>) {
    this._workspaceStore.deleteWorkspace(workspace);
  }

  onCreateApplication(workspaceId: string) {
    this._applicationStore.createApplication({ workspaceId });
  }

  onUpdateApplication(application: Document<Application>) {
    this._applicationStore.updateApplication(application);
  }

  onDeleteApplication(application: Document<Application>) {
    this._applicationStore.deleteApplication(application);
  }

  onCreateCollection(workspaceId: string, applicationId: string) {
    this._collectionStore.createCollection({ workspaceId, applicationId });
  }

  onUpdateCollection(collection: Document<Collection>) {
    this._collectionStore.updateCollection(collection);
  }

  onDeleteCollection(collection: Document<Collection>) {
    this._collectionStore.deleteCollection(collection);
  }

  onCreateInstruction() {
    this._instructionStore.createInstruction();
  }

  onUpdateInstruction(instruction: Document<Instruction>) {
    this._instructionStore.updateInstruction(instruction);
  }

  onDeleteInstruction(instruction: Document<Instruction>) {
    this._instructionStore.deleteInstruction(instruction);
  }

  onDownloadWorkspace(workspace: Document<Workspace>) {
    this._workspaceStore.downloadWorkspace(workspace);
  }
}
