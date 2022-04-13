import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TabStore } from '@bulldozer-client/core-data-access';
import {
  InstructionApiService,
  InstructionStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { InstructionDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { combineLatest, distinctUntilChanged, map } from 'rxjs';
import { ViewInstructionStore } from './view-instruction.store';

@Component({
  selector: 'bd-view-instruction',
  template: `
    <ng-container *ngrxLet="instruction$; let instruction">
      <aside class="w-80 flex flex-col flex-shrink-0">
        <header class="py-5 px-7 border-b mb-0 w-full hd-border-gray">
          <ng-container *ngIf="instruction !== null; else notFound">
            <p class="mb-0 text-xl uppercase">{{ instruction.name }}</p>
            <p class="text-xs m-0">
              Visualize all the details about this instruction.
            </p>
          </ng-container>
          <ng-template #notFound>
            <p class="mb-0 text-xl uppercase">not found</p>
            <p class="text-xs m-0">
              The instruction you're trying to visualize is not available.
            </p>
          </ng-template>
        </header>

        <ng-container *ngrxLet="workspaceId$; let workspaceId">
          <ng-container *ngrxLet="applicationId$; let applicationId">
            <ng-container *ngrxLet="instructionId$; let instructionId">
              <ul
                class="flex-1"
                *ngIf="
                  workspaceId !== null &&
                  applicationId !== null &&
                  instructionId !== null
                "
              >
                <li>
                  <a
                    class="flex flex-col gap-1 border-l-4 py-5 px-7"
                    [routerLink]="[
                      '/workspaces',
                      workspaceId,
                      'applications',
                      applicationId,
                      'instructions',
                      instructionId,
                      'arguments'
                    ]"
                    [routerLinkActive]="[
                      'bg-white',
                      'bg-opacity-5',
                      'border-primary'
                    ]"
                    [ngClass]="{
                      'border-transparent': !isRouteActive(
                        '/workspaces/' +
                          workspaceId +
                          '/applications/' +
                          applicationId +
                          '/instructions/' +
                          instructionId +
                          '/arguments'
                      )
                    }"
                  >
                    <span class="text-lg font-bold">Arguments</span>
                    <span class="text-xs font-thin">
                      Visualize the list of arguments.
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    class="flex flex-col gap-1 border-l-4 py-5 px-7"
                    [routerLink]="[
                      '/workspaces',
                      workspaceId,
                      'applications',
                      applicationId,
                      'instructions',
                      instructionId,
                      'documents'
                    ]"
                    [routerLinkActive]="[
                      'bg-white',
                      'bg-opacity-5',
                      'border-primary'
                    ]"
                    [ngClass]="{
                      'border-transparent': !isRouteActive(
                        '/workspaces/' +
                          workspaceId +
                          '/applications/' +
                          applicationId +
                          '/instructions/' +
                          instructionId +
                          '/documents'
                      )
                    }"
                  >
                    <span class="text-lg font-bold">Documents</span>
                    <span class="text-xs font-thin">
                      Visualize the list of documents.
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    class="flex flex-col gap-1 border-l-4 py-5 px-7"
                    [routerLink]="[
                      '/workspaces',
                      workspaceId,
                      'applications',
                      applicationId,
                      'instructions',
                      instructionId,
                      'signers'
                    ]"
                    [routerLinkActive]="[
                      'bg-white',
                      'bg-opacity-5',
                      'border-primary'
                    ]"
                    [ngClass]="{
                      'border-transparent': !isRouteActive(
                        '/workspaces/' +
                          workspaceId +
                          '/applications/' +
                          applicationId +
                          '/instructions/' +
                          instructionId +
                          '/signers'
                      )
                    }"
                  >
                    <span class="text-lg font-bold">Signers</span>
                    <span class="text-xs font-thin">
                      Visualize the list of signers.
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    class="flex flex-col gap-1 border-l-4 py-5 px-7"
                    [routerLink]="[
                      '/workspaces',
                      workspaceId,
                      'applications',
                      applicationId,
                      'instructions',
                      instructionId,
                      'code-editor'
                    ]"
                    [routerLinkActive]="[
                      'bg-white',
                      'bg-opacity-5',
                      'border-primary'
                    ]"
                    [ngClass]="{
                      'border-transparent': !isRouteActive(
                        '/workspaces/' +
                          workspaceId +
                          '/applications/' +
                          applicationId +
                          '/instructions/' +
                          instructionId +
                          '/code-editor'
                      )
                    }"
                  >
                    <span class="text-lg font-bold">Code Editor</span>
                    <span class="text-xs font-thin">
                      Edit instruction code.
                    </span>
                  </a>
                </li>
              </ul>
            </ng-container>
          </ng-container>
        </ng-container>

        <footer
          class="sticky bottom-0 bd-bg-black py-5 px-7 w-full flex justify-center items-center gap-2 border-t border-white border-opacity-10 shadow-inner"
          *hdWalletAdapter="
            let publicKey = publicKey;
            let connected = connected
          "
        >
          <ng-container *ngIf="publicKey !== null && instruction !== null">
            <button
              mat-stroked-button
              color="accent"
              bdEditInstruction
              [instruction]="instruction"
              (editInstruction)="
                onUpdateInstruction(
                  publicKey.toBase58(),
                  instruction.workspaceId,
                  instruction.applicationId,
                  instruction.id,
                  $event
                )
              "
              [disabled]="!connected || (instruction | bdItemChanging)"
            >
              Edit
            </button>
            <button
              mat-stroked-button
              color="warn"
              (click)="
                onDeleteInstruction(
                  publicKey.toBase58(),
                  instruction.workspaceId,
                  instruction.applicationId,
                  instruction.id
                )
              "
              [disabled]="!connected || (instruction | bdItemChanging)"
            >
              Delete
            </button>
          </ng-container>
        </footer>
      </aside>
    </ng-container>

    <div class="flex-1">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [InstructionStore, ViewInstructionStore],
})
export class ViewInstructionComponent implements OnInit {
  @HostBinding('class') class = 'flex h-full';
  readonly instruction$ = this._viewInstructionStore.instruction$;
  readonly loading$ = this._instructionStore.loading$;
  readonly workspaceId$ = this._route.paramMap.pipe(
    map((paramMap) => paramMap.get('workspaceId')),
    isNotNullOrUndefined,
    distinctUntilChanged()
  );
  readonly applicationId$ = this._route.paramMap.pipe(
    map((paramMap) => paramMap.get('applicationId')),
    isNotNullOrUndefined,
    distinctUntilChanged()
  );
  readonly instructionId$ = this._route.paramMap.pipe(
    map((paramMap) => paramMap.get('instructionId')),
    isNotNullOrUndefined,
    distinctUntilChanged()
  );

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _tabStore: TabStore,
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _instructionApiService: InstructionApiService,
    private readonly _instructionStore: InstructionStore,
    private readonly _viewInstructionStore: ViewInstructionStore
  ) {}

  ngOnInit() {
    this._viewInstructionStore.setInstructionId(this.instructionId$);
    this._tabStore.openTab(
      combineLatest({
        workspaceId: this.workspaceId$,
        applicationId: this.applicationId$,
        instructionId: this.instructionId$,
      }).pipe(
        map(({ instructionId, applicationId, workspaceId }) => ({
          id: instructionId,
          kind: 'instruction',
          url: `/workspaces/${workspaceId}/applications/${applicationId}/instructions/${instructionId}`,
        }))
      )
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

  onUpdateInstruction(
    authority: string,
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    instructionDto: InstructionDto
  ) {
    this._instructionApiService
      .update({
        authority,
        workspaceId,
        applicationId,
        instructionDto,
        instructionId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Update instruction request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `authority:${authority}`,
                  `applications:${applicationId}:instructions`,
                  `instructions:${instructionId}`,
                ],
              },
            })
          );
        },
        error: (error) => {
          this._notificationStore.setError(error);
        },
      });
  }

  onDeleteInstruction(
    authority: string,
    workspaceId: string,
    applicationId: string,
    instructionId: string
  ) {
    this._instructionApiService
      .delete({
        authority,
        workspaceId,
        applicationId,
        instructionId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Delete instruction request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `authority:${authority}`,
                  `applications:${applicationId}:instructions`,
                  `instructions:${instructionId}`,
                ],
              },
            })
          );
        },
        error: (error) => {
          this._notificationStore.setError(error);
        },
      });
  }
}
