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
  CollectionExtended,
  InstructionExtended,
  Workspace,
} from '@heavy-duty/bulldozer/application/utils/types';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer/data-access';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { combineLatest, map } from 'rxjs';
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
  @Output() downloadWorkspace = new EventEmitter();
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
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore,
    private readonly _navigationStore: NavigationStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _instructionStore: InstructionStore,
    private readonly _bulldozerProgramStore: BulldozerProgramStore
  ) {}

  onCreateWorkspace() {
    this._workspaceStore.createWorkspace();
  }

  onUpdateWorkspace(workspace: Workspace) {
    this._workspaceStore.updateWorkspace(workspace);
  }

  onDeleteWorkspace(workspace: Workspace) {
    const applications$ = this._bulldozerProgramStore.getApplications(
      workspace.id
    );
    const collections$ = this._bulldozerProgramStore.getExtendedCollections(
      workspace.id
    );
    const instructions$ = this._bulldozerProgramStore.getExtendedInstructions(
      workspace.id
    );

    this._workspaceStore.deleteWorkspace(
      combineLatest([applications$, collections$, instructions$]).pipe(
        map(([applications, collections, instructions]) => ({
          workspace,
          applications,
          collections,
          instructions,
        }))
      )
    );
  }

  onCreateApplication() {
    this._applicationStore.createApplication();
  }

  onUpdateApplication(application: Application) {
    this._applicationStore.updateApplication(application);
  }

  onDeleteApplication(application: Application) {
    const collections$ = this._collectionStore.collections$.pipe(
      map((collections) =>
        collections.filter(({ data }) => application.id === data.application)
      )
    );
    const instructions$ = this._instructionStore.instructions$.pipe(
      map((instructions) =>
        instructions.filter(({ data }) => application.id === data.application)
      )
    );

    this._applicationStore.deleteApplication(
      combineLatest([collections$, instructions$]).pipe(
        map(([collections, instructions]) => ({
          application,
          collections,
          instructions,
        }))
      )
    );
  }

  onCreateCollection() {
    this._collectionStore.createCollection();
  }

  onUpdateCollection(collection: CollectionExtended) {
    this._collectionStore.updateCollection(collection);
  }

  onDeleteCollection(collection: CollectionExtended) {
    this._collectionStore.deleteCollection(collection);
  }

  onCreateInstruction() {
    this._instructionStore.createInstruction();
  }

  onUpdateInstruction(instruction: InstructionExtended) {
    this._instructionStore.updateInstruction(instruction);
  }

  onDeleteInstruction(instruction: InstructionExtended) {
    this._instructionStore.deleteInstruction(instruction);
  }

  onDownloadWorkspace(workspace: Workspace) {
    this.downloadWorkspace.emit(workspace);
  }
}
