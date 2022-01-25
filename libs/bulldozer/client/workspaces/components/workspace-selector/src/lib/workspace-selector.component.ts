import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import { WorkspaceSelectorStore } from './workspace-selector.store';

@Component({
  selector: 'bd-workspace-selector',
  template: `
    <ng-container *ngrxLet="workspace$; let activeWorkspace">
      <button type="button" mat-raised-button [matMenuTriggerFor]="menu">
        {{
          activeWorkspace === undefined
            ? 'Select workspace'
            : activeWorkspace?.name
        }}
      </button>
      <mat-menu #menu="matMenu" class="px-4 py-2">
        <mat-list role="list" class="p-0" bdStopPropagation>
          <mat-list-item
            *ngFor="let workspace of workspaces$ | ngrxPush"
            role="listitem"
            class="w-60 h-auto mb-2 pt-4 pb-3 border-b-4 border-transparent bg-white bg-opacity-5 mat-elevation-z2"
            [ngClass]="{
              'border-b-primary': activeWorkspace?.id === workspace.id
            }"
          >
            <div class="w-full">
              <p class="text-xl font-bold mb-0 flex justify-between">
                <span
                  class="flex-grow leading-8 overflow-hidden"
                  [matTooltip]="workspace.name"
                  matTooltipShowDelay="500"
                >
                  {{ workspace.name }}
                </span>
                <button
                  mat-icon-button
                  color="primary"
                  class="w-8 h-8 leading-8 flex-shrink-0"
                  [attr.aria-label]="
                    'Download ' + workspace.name + ' workspace'
                  "
                  (click)="onDownloadWorkspace(workspace.id)"
                >
                  <mat-icon>download</mat-icon>
                </button>
              </p>

              <p class="mb-2">
                <a
                  class="text-xs"
                  [routerLink]="['/workspaces', workspace.id]"
                  [ngClass]="{
                    'underline text-primary':
                      activeWorkspace?.id !== workspace.id,
                    'opacity-50 italic': activeWorkspace?.id === workspace.id
                  }"
                >
                  {{
                    activeWorkspace?.id === workspace.id ? 'Active' : 'Activate'
                  }}
                </a>
              </p>

              <div>
                <button
                  class="mr-2"
                  type="button"
                  mat-raised-button
                  color="primary"
                  (click)="onEditWorkspace(workspace)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  mat-raised-button
                  color="primary"
                  (click)="onDeleteWorkspace(workspace)"
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
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WorkspaceSelectorStore],
})
export class WorkspaceSelectorComponent {
  @ViewChild(MatMenu) private _workspaceMenu?: MatMenu;
  readonly workspace$ = this._workspaceSelectorStore.workspace$;
  readonly workspaces$ = this._workspaceSelectorStore.workspaces$;

  constructor(
    private readonly _workspaceSelectorStore: WorkspaceSelectorStore
  ) {}

  private _closeMenu() {
    if (this._workspaceMenu) {
      this._workspaceMenu.closed.emit('click');
    }
  }

  onCreateWorkspace() {
    this._closeMenu();
    this._workspaceSelectorStore.createWorkspace();
  }

  onEditWorkspace(workspace: Document<Workspace>) {
    this._closeMenu();
    this._workspaceSelectorStore.updateWorkspace(workspace);
  }

  onDeleteWorkspace(workspace: Document<Workspace>) {
    this._closeMenu();
    this._workspaceSelectorStore.deleteWorkspace(workspace);
  }

  onDownloadWorkspace(workspaceId: string) {
    this._closeMenu();
    this._workspaceSelectorStore.downloadWorkspace(workspaceId);
  }
}
