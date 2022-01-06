import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  Application,
  Collection,
  Document,
  Instruction,
  Workspace,
} from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import {
  ApplicationStore,
  CollectionAttributeStore,
  CollectionStore,
  InstructionAccountStore,
  InstructionArgumentStore,
  InstructionRelationStore,
  InstructionStore,
  TabStore,
  WorkspaceStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { ShellStore } from './shell.store';

@Component({
  selector: 'bd-shell',
  template: `
    <mat-sidenav-container fullscreen>
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
                (createInstruction)="
                  onCreateInstruction(
                    application.data.workspace,
                    application.id
                  )
                "
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

        <nav mat-tab-nav-bar>
          <div
            mat-tab-link
            class="flex items-center justify-between p-0"
            *ngFor="let tab of tabs$ | ngrxPush"
            [active]="(selectedTab$ | ngrxPush) === tab.id"
          >
            <a [routerLink]="tab.url">
              {{ tab.label }}
            </a>
            <button
              mat-icon-button
              (click)="onCloseTab($event, tab.id)"
              [attr.aria-label]="'Close ' + tab.label + ' tab'"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </nav>
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    BulldozerProgramStore,
    WorkspaceStore,
    ApplicationStore,
    TabStore,
    CollectionStore,
    CollectionAttributeStore,
    InstructionStore,
    InstructionAccountStore,
    InstructionArgumentStore,
    InstructionRelationStore,
    ShellStore,
  ],
})
export class ShellComponent implements OnInit {
  readonly workspace$ = this._shellStore.workspace$;
  readonly workspaces$ = this._shellStore.workspaces$;
  readonly tabs$ = this._shellStore.tabs$;
  readonly selectedTab$ = this._shellStore.selectedTab$;
  readonly connected$ = this._shellStore.connected$;
  readonly workspaceId$ = this._shellStore.workspaceId$;
  readonly applications$ = this._shellStore.applications$;
  readonly collections$ = this._shellStore.collections$;
  readonly instructions$ = this._shellStore.instructions$;
  readonly application$ = this._shellStore.application$;
  readonly isHandset$ = this._shellStore.isHandset$;

  constructor(private readonly _shellStore: ShellStore) {}

  ngOnInit() {
    this._shellStore.loadData();
  }

  onCreateWorkspace() {
    this._shellStore.createWorkspace();
  }

  onUpdateWorkspace(workspace: Document<Workspace>) {
    this._shellStore.updateWorkspace(workspace);
  }

  onDeleteWorkspace(workspace: Document<Workspace>) {
    this._shellStore.deleteWorkspace(workspace);
  }

  onDownloadWorkspace(workspaceId: string) {
    this._shellStore.downloadWorkspace(workspaceId);
  }

  onCreateApplication(workspaceId: string) {
    this._shellStore.createApplication(workspaceId);
  }

  onUpdateApplication(application: Document<Application>) {
    this._shellStore.updateApplication(application);
  }

  onDeleteApplication(application: Document<Application>) {
    this._shellStore.deleteApplication(application);
  }

  onCreateCollection(workspaceId: string, applicationId: string) {
    this._shellStore.createCollection({ workspaceId, applicationId });
  }

  onUpdateCollection(collection: Document<Collection>) {
    this._shellStore.updateCollection(collection);
  }

  onDeleteCollection(collection: Document<Collection>) {
    this._shellStore.deleteCollection(collection);
  }

  onCreateInstruction(workspaceId: string, applicationId: string) {
    this._shellStore.createInstruction({ workspaceId, applicationId });
  }

  onUpdateInstruction(instruction: Document<Instruction>) {
    this._shellStore.updateInstruction(instruction);
  }

  onDeleteInstruction(instruction: Document<Instruction>) {
    this._shellStore.deleteInstruction(instruction);
  }
}
