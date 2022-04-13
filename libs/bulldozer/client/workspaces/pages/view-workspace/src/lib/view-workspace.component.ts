import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceStore } from '@bulldozer-client/workspaces-data-access';
import { map } from 'rxjs';
import { ViewWorkspaceStore } from './view-workspace.store';

@Component({
  selector: 'bd-view-workspace',
  template: `
    <ng-container *ngIf="workspace$ | ngrxPush as workspace">
      <aside class="w-80 flex flex-col flex-shrink-0">
        <header class="py-5 px-7 border-b mb-0 w-full hd-border-gray">
          <p class="mb-0 text-xl uppercase">{{ workspace.name }}</p>
          <p class="text-xs">Visualize all the details about this workspace.</p>
        </header>

        <ul class="flex-1">
          <li>
            <a
              class="flex flex-col gap-1 border-l-4 py-5 px-7"
              [routerLink]="['/workspaces', workspace.id, 'budget']"
              [routerLinkActive]="[
                'bg-white',
                'bg-opacity-5',
                'border-primary'
              ]"
              [ngClass]="{
                'border-transparent': !isRouteActive(
                  '/workspaces/' + workspace.id + '/budget'
                )
              }"
            >
              <span class="text-lg font-bold">Budget</span>
              <span class="text-xs font-thin"> Visualize budget details. </span>
            </a>
          </li>
          <li>
            <a
              class="flex flex-col gap-1 border-l-4 py-5 px-7"
              [routerLink]="['/workspaces', workspace.id, 'collaborators']"
              [routerLinkActive]="[
                'bg-white',
                'bg-opacity-5',
                'border-primary'
              ]"
              [ngClass]="{
                'border-transparent': !isRouteActive(
                  '/workspaces/' + workspace.id + '/collaborators'
                )
              }"
            >
              <span class="text-lg font-bold">Collaborators</span>
              <span class="text-xs font-thin">
                Visualize and manage collaborators.
              </span>
            </a>
          </li>

          <li>
            <a
              class="flex flex-col gap-1 border-l-4 py-5 px-7"
              [routerLink]="['/workspaces', workspace.id, 'instructions']"
              [routerLinkActive]="[
                'bg-white',
                'bg-opacity-5',
                'border-primary'
              ]"
              [ngClass]="{
                'border-transparent': !isRouteActive(
                  '/workspaces/' + workspace.id + '/instructions'
                )
              }"
            >
              <span class="text-lg font-bold">Instructions</span>
              <span class="text-xs font-thin">
                Visualize all the ongoing instructions.
              </span>
            </a>
          </li>
        </ul>

        <footer
          class="sticky bottom-0 bd-bg-black py-5 px-7 w-full flex justify-center items-center gap-2 border-t border-white border-opacity-10 shadow-inner"
        >
          <button
            mat-stroked-button
            color="accent"
            bdEditWorkspace
            [workspace]="workspace"
            (editWorkspace)="onUpdateWorkspace(workspace.id, $event)"
          >
            Edit
          </button>
          <button
            mat-stroked-button
            color="warn"
            (click)="onDeleteWorkspace(workspace.id)"
          >
            Delete
          </button>
        </footer>
      </aside>

      <div class="flex-1">
        <router-outlet></router-outlet>
      </div>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WorkspaceStore, ViewWorkspaceStore],
})
export class ViewWorkspaceComponent implements OnInit {
  @HostBinding('class') class = 'flex h-full';

  readonly workspace$ = this._workspaceStore.workspace$;

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _viewWorkspaceStore: ViewWorkspaceStore
  ) {}

  ngOnInit() {
    this._viewWorkspaceStore.setWorkspaceId(
      this._route.paramMap.pipe(map((paramMap) => paramMap.get('workspaceId')))
    );
  }

  isRouteActive(url: string) {
    return this._router.isActive(url, {
      paths: 'exact',
      queryParams: 'exact',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  onUpdateWorkspace(workspaceId: string, workspaceName: string) {
    this._viewWorkspaceStore.updateWorkspace({
      workspaceId,
      workspaceName,
    });
  }

  onDeleteWorkspace(workspaceId: string) {
    this._viewWorkspaceStore.deleteWorkspace(workspaceId);
  }
}
