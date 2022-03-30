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
      <aside class="w-96 flex flex-col">
        <header class="py-5 px-7 border-b mb-0 w-full hd-border-gray">
          <h1 class="mb-0 text-xl uppercase">{{ workspace.document.name }}</h1>
          <p class="text-xs">Visualize all the details about this workspace.</p>
        </header>

        <ul>
          <li>
            <a
              class="flex flex-col gap-1 border-l-4 py-5 px-7"
              [routerLink]="['/workspaces', workspace.document.id, 'budget']"
              [routerLinkActive]="[
                'bg-white',
                'bg-opacity-5',
                'border-primary'
              ]"
              [ngClass]="{
                'border-transparent': !isRouteActive(
                  '/workspaces/' + workspace.document.id + '/budget'
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
              [routerLink]="[
                '/workspaces',
                workspace.document.id,
                'collaborators'
              ]"
              [routerLinkActive]="[
                'bg-white',
                'bg-opacity-5',
                'border-primary'
              ]"
              [ngClass]="{
                'border-transparent': !isRouteActive(
                  '/workspaces/' + workspace.document.id + '/collaborators'
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
              [routerLink]="[
                '/workspaces',
                workspace.document.id,
                'instructions'
              ]"
              [routerLinkActive]="[
                'bg-white',
                'bg-opacity-5',
                'border-primary'
              ]"
              [ngClass]="{
                'border-transparent': !isRouteActive(
                  '/workspaces/' + workspace.document.id + '/instructions'
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
      </aside>

      <main class="bg-white bg-opacity-5 w-full">
        <router-outlet></router-outlet>
      </main>
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
}
