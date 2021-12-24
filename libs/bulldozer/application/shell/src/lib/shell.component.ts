import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  ApplicationStore,
  CollectionStore,
  InstructionStore,
  WorkspaceStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { Workspace } from '@heavy-duty/bulldozer/application/utils/types';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { ApplicationShellStore } from './shell.store';

@Component({
  selector: 'bd-application-shell',
  template: `
    <bd-navigation (downloadWorkspace)="onDownloadWorkspace($event)">
      <nav mat-tab-nav-bar *ngIf="applicationId$ | ngrxPush as applicationId">
        <div
          mat-tab-link
          class="flex items-center justify-between p-0"
          *ngFor="let tab of tabs$ | ngrxPush"
          [active]="(selectedTab$ | ngrxPush) === tab.id"
        >
          <a
            [routerLink]="[
              '/workspaces',
              tab.workspaceId,
              'applications',
              applicationId,
              tab.kind,
              tab.id
            ]"
          >
            {{ tab.title }}
          </a>
          <button
            mat-icon-button
            (click)="onCloseTab($event, tab.id)"
            [attr.aria-label]="'Close ' + tab.title + ' tab'"
          >
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </nav>
      <router-outlet></router-outlet>
    </bd-navigation>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    WorkspaceStore,
    ApplicationStore,
    CollectionStore,
    InstructionStore,
    ApplicationShellStore,
  ],
})
export class ApplicationShellComponent implements OnInit, OnDestroy {
  private readonly _destroy = new Subject();
  private readonly _destroy$ = this._destroy.asObservable();
  readonly applicationId$ = this._applicationStore.applicationId$;
  readonly tabs$ = this._applicationShellStore.tabs$;
  readonly selectedTab$ = this._applicationShellStore.selected$;

  constructor(
    private readonly _applicationShellStore: ApplicationShellStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _walletStore: WalletStore,
    private readonly _router: Router
  ) {}

  ngOnInit() {
    this._walletStore.connected$
      .pipe(
        filter((connected) => !connected),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        this._router.navigate(['/unauthorized-access'], {
          queryParams: {
            redirect: this._router.routerState.snapshot.url,
          },
        });
      });
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  onDownloadWorkspace(workspace: Workspace) {
    this._applicationShellStore.downloadWorkspace(workspace);
  }

  onCloseTab(event: Event, tabId: string) {
    event.stopPropagation();
    event.preventDefault();
    this._applicationShellStore.closeTab(tabId);
  }
}
