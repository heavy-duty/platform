import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BudgetStore } from '@bulldozer-client/budgets-data-access';
import {
  CollaboratorsStore,
  CollaboratorStore,
} from '@bulldozer-client/collaborators-data-access';
import { UserStore } from '@bulldozer-client/users-data-access';
import {
  WorkspaceInstructionsStore,
  WorkspaceStore,
} from '@bulldozer-client/workspaces-data-access';
import { map } from 'rxjs';
import { ViewWorkspaceStore } from './view-workspace.store';

@Component({
  selector: 'bd-view-workspace',
  template: `
    <div class="flex flex-col" *ngIf="workspace$ | ngrxPush as workspace">
      <mat-sidenav-container class="hd-view-profile-height">
        <mat-sidenav
          #userProfileInfo
          class="w-96"
          [mode]="'side'"
          [opened]="true"
        >
          <header class="py-5 px-7 border-b mb-0 w-full hd-border-gray">
            <h2 class="mb-0 ">{{ workspace.document.name }}</h2>
            <small class="leading-3">
              Visualize all the details about this workspace
            </small>
          </header>

          <main class="flex flex-col">
            <mat-selection-list [multiple]="false">
              <mat-list-option
                [value]="'user-info'"
                [routerLink]="['/workspaces', workspace.document.id, 'budget']"
                [selected]="
                  isRouteActive(
                    '/workspaces/' + workspace.document.id + '/budget'
                  )
                "
              >
                <div class="py-6 px-3">
                  <h2 class="mb-1">Budget</h2>
                  <small class="leading-3"> Visualize budget details </small>
                </div>
              </mat-list-option>
              <mat-list-option
                [value]="'workspaces'"
                [routerLink]="[
                  '/workspaces',
                  workspace.document.id,
                  'collaborators'
                ]"
                [selected]="
                  isRouteActive(
                    '/workspaces/' + workspace.document.id + '/collaborators'
                  )
                "
              >
                <div class="py-6 px-3">
                  <h2 class="mb-1">Collaborators</h2>
                  <small class="leading-3">
                    Visualize and manage collaborators
                  </small>
                </div>
              </mat-list-option>
              <mat-list-option
                [value]="'workspaces'"
                [routerLink]="[
                  '/workspaces',
                  workspace.document.id,
                  'instructions'
                ]"
                [selected]="
                  isRouteActive(
                    '/workspaces/' + workspace.document.id + '/instructions'
                  )
                "
              >
                <div class="py-6 px-3">
                  <h2 class="mb-1">Instructions</h2>
                  <small class="leading-3">
                    Visualize all the ongoing instructions
                  </small>
                </div>
              </mat-list-option>
            </mat-selection-list>
          </main>
        </mat-sidenav>
        <mat-sidenav-content>
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
    <!-- <div
      *ngIf="workspace$ | ngrxPush as workspace"
      class="flex flex-col gap-5 p-5"
    >
      <header bdPageHeader>
        <h1 class="flex items-center justify-start gap-2">
          <span
            [matTooltip]="
              workspace.document.name
                | bdItemUpdatingMessage: workspace:'Workspace'
            "
            matTooltipShowDelay="500"
          >
            {{ workspace.document.name }}
          </span>
          <mat-progress-spinner
            *ngIf="workspace | bdItemShowSpinner"
            diameter="16"
            mode="indeterminate"
          ></mat-progress-spinner>
        </h1>
        <p>Visualize all the details about this workspace.</p>
      </header>

      <main class="flex flex-col gap-4">




      </main>
    </div> -->
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    WorkspaceStore,
    ViewWorkspaceStore,
    CollaboratorsStore,
    CollaboratorStore,
    BudgetStore,
  ],
})
export class ViewWorkspaceComponent implements OnInit {
  readonly workspace$ = this._workspaceStore.workspace$;

  readonly budget$ = this._budgetStore.budget$;
  readonly user$ = this._userStore.user$;
  readonly collaborator$ = this._collaboratorStore.collaborator$;

  readonly instructionStatuses$ =
    this._workspaceInstructionsStore.instructionStatuses$;

  constructor(
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _collaboratorStore: CollaboratorStore,
    private readonly _userStore: UserStore,
    private readonly _budgetStore: BudgetStore,
    private readonly _workspaceInstructionsStore: WorkspaceInstructionsStore,
    private readonly _router: Router,
    private readonly _viewWorkspaceStore: ViewWorkspaceStore,
    private readonly _route: ActivatedRoute
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
