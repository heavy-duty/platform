import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import {
  InstructionStore,
  TabsStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { ActiveBreakpointService } from '@heavy-duty/bulldozer/application/utils/services/active-breakpoint';
import {
  InstructionArgument,
  InstructionBasicAccount,
  InstructionProgramAccount,
  InstructionSignerAccount,
} from '@heavy-duty/bulldozer/data-access';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'bd-view-instruction',
  template: `
    <ng-container *ngIf="instruction$ | ngrxPush as instruction">
      <header bdPageHeader>
        <h1>
          {{ instruction.data.name }}
          <button
            mat-icon-button
            color="primary"
            aria-label="Reload collection"
            (click)="onReload()"
          >
            <mat-icon>refresh</mat-icon>
          </button>
        </h1>
        <p>Visualize all the details about this instruction.</p>
      </header>

      <main>
        <section *ngrxLet="arguments$; let arguments">
          <h2 class="flex items-center">
            Arguments

            <button
              mat-icon-button
              aria-label="Arguments menu"
              [matMenuTriggerFor]="argumentsMenu"
            >
              <mat-icon>more_vert</mat-icon>
            </button>

            <mat-menu #argumentsMenu="matMenu">
              <button
                mat-menu-item
                (click)="onCreateInstructionArgument()"
                [disabled]="(connected$ | ngrxPush) === false"
              >
                <mat-icon>add</mat-icon>
                <span>Add argument</span>
              </button>
            </mat-menu>
          </h2>

          <mat-grid-list
            *ngIf="arguments.length > 0; else emptyList"
            [cols]="gridCols$ | ngrxPush"
            rowHeight="11rem"
            gutterSize="16"
          >
            <mat-grid-tile
              *ngFor="let argument of arguments"
              [colspan]="1"
              [rowspan]="1"
              class="overflow-visible"
            >
              <mat-card class="w-full h-full">
                <h3 class="flex justify-between items-center">
                  {{ argument.data.name }}
                  <button
                    mat-icon-button
                    aria-label="Argument menu"
                    [matMenuTriggerFor]="argumentMenu"
                  >
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #argumentMenu="matMenu">
                    <button
                      mat-menu-item
                      (click)="onEditInstructionArgument(argument)"
                      [disabled]="(connected$ | ngrxPush) === false"
                    >
                      <mat-icon>edit</mat-icon>
                      <span>Edit argument</span>
                    </button>
                    <button
                      mat-menu-item
                      (click)="onDeleteInstructionArgument(argument.id)"
                      [disabled]="(connected$ | ngrxPush) === false"
                    >
                      <mat-icon>delete</mat-icon>
                      <span>Delete argument</span>
                    </button>
                  </mat-menu>
                </h3>
                <p>Kind: {{ argument.data.kind.name }}.</p>
                <p>
                  Modifier: {{ argument.data.modifier.name }} ({{
                    argument.data.modifier.size
                  }}).
                </p>
              </mat-card>
            </mat-grid-tile>
          </mat-grid-list>

          <ng-template #emptyList>
            <p class="text-center text-xl">There's no arguments yet.</p>
          </ng-template>
        </section>

        <section>
          <h2 class="flex items-center my-4">
            Accounts

            <button
              mat-icon-button
              aria-label="Accounts menu"
              [matMenuTriggerFor]="accountsMenu"
            >
              <mat-icon>more_vert</mat-icon>
            </button>

            <mat-menu #accountsMenu="matMenu">
              <button mat-menu-item [matMenuTriggerFor]="addAccountMenu">
                Add account
              </button>
            </mat-menu>

            <mat-menu #addAccountMenu="matMenu">
              <button
                mat-menu-item
                (click)="onCreateInstructionBasicAccount()"
                [disabled]="(connected$ | ngrxPush) === false"
              >
                <mat-icon>description</mat-icon>
                <span>Basic account</span>
              </button>
              <button
                mat-menu-item
                (click)="onCreateInstructionSignerAccount()"
                [disabled]="(connected$ | ngrxPush) === false"
              >
                <mat-icon>rate_review</mat-icon>
                <span>Signer account</span>
              </button>
              <button
                mat-menu-item
                (click)="onCreateInstructionProgramAccount()"
                [disabled]="(connected$ | ngrxPush) === false"
              >
                <mat-icon>group_work</mat-icon>
                <span>Program account</span>
              </button>
            </mat-menu>
          </h2>

          <mat-grid-list
            [cols]="gridCols$ | ngrxPush"
            rowHeight="10rem"
            gutterSize="16"
            *ngIf="(accountsCount$ | ngrxPush) > 0; else emptyList"
          >
            <mat-grid-tile
              *ngFor="let account of basicAccounts$ | ngrxPush"
              [colspan]="1"
              [rowspan]="1"
              class="overflow-visible"
            >
              <mat-card class="w-full h-full">
                <h3 class="flex justify-between items-center">
                  {{ account.data.name }}

                  <button
                    mat-icon-button
                    aria-label="Basic account menu"
                    [matMenuTriggerFor]="basicAccountMenu"
                  >
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #basicAccountMenu="matMenu">
                    <button
                      mat-menu-item
                      (click)="onEditInstructionBasicAccount(account)"
                      [disabled]="(connected$ | ngrxPush) === false"
                    >
                      <mat-icon>edit</mat-icon>
                      <span>Edit account</span>
                    </button>
                    <button
                      mat-menu-item
                      (click)="onDeleteInstructionBasicAccount(account.id)"
                      [disabled]="(connected$ | ngrxPush) === false"
                    >
                      <mat-icon>delete</mat-icon>
                      <span>Delete account</span>
                    </button>
                  </mat-menu>
                </h3>
                <p>Mark argument: {{ account.data.markAttribute.name }}</p>
                <p>
                  Collection:
                  {{ account.data.collection | obscureAddress }}
                  <a
                    [routerLink]="[
                      '/applications',
                      account.data.application,
                      'collections',
                      account.data.collection
                    ]"
                    >view</a
                  >
                </p>
              </mat-card>
            </mat-grid-tile>

            <mat-grid-tile
              *ngFor="let account of signerAccounts$ | ngrxPush"
              [colspan]="1"
              [rowspan]="1"
              class="overflow-visible"
            >
              <mat-card class="w-full h-full">
                <h3 class="flex justify-between items-center">
                  {{ account.data.name }}
                  <button
                    mat-icon-button
                    aria-label="Signer account menu"
                    [matMenuTriggerFor]="signerAccountMenu"
                  >
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #signerAccountMenu="matMenu">
                    <button
                      mat-menu-item
                      (click)="onEditInstructionSignerAccount(account)"
                      [disabled]="(connected$ | ngrxPush) === false"
                    >
                      <mat-icon>edit</mat-icon>
                      <span>Edit account</span>
                    </button>
                    <button
                      mat-menu-item
                      (click)="onDeleteInstructionSignerAccount(account.id)"
                      [disabled]="(connected$ | ngrxPush) === false"
                    >
                      <mat-icon>delete</mat-icon>
                      <span>Delete account</span>
                    </button>
                  </mat-menu>
                </h3>
                <p>Mark argument: {{ account.data.markAttribute.name }}</p>
              </mat-card>
            </mat-grid-tile>

            <mat-grid-tile
              *ngFor="let account of programAccounts$ | ngrxPush"
              [colspan]="1"
              [rowspan]="1"
              class="overflow-visible"
            >
              <mat-card class="w-full h-full">
                <h3 class="flex justify-between items-center">
                  {{ account.data.name }}
                  <button
                    mat-icon-button
                    aria-label="Program account menu"
                    [matMenuTriggerFor]="programAccountMenu"
                  >
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #programAccountMenu="matMenu">
                    <button
                      mat-menu-item
                      (click)="onEditInstructionProgramAccount(account)"
                      [disabled]="(connected$ | ngrxPush) === false"
                    >
                      <mat-icon>edit</mat-icon>
                      <span>Edit account</span>
                    </button>
                    <button
                      mat-menu-item
                      (click)="onDeleteInstructionProgramAccount(account.id)"
                      [disabled]="(connected$ | ngrxPush) === false"
                    >
                      <mat-icon>delete</mat-icon>
                      <span>Delete account</span>
                    </button>
                  </mat-menu>
                </h3>
                <p>
                  Program:
                  {{ account.data.program | obscureAddress }}
                </p>
              </mat-card>
            </mat-grid-tile>
          </mat-grid-list>

          <ng-template #emptyList>
            <p class="text-center text-xl">There's no accounts yet.</p>
          </ng-template>
        </section>
      </main>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewInstructionComponent implements OnInit {
  @HostBinding('class') class = 'block p-4';
  readonly connected$ = this._walletStore.connected$;
  readonly instruction$ = this._tabsStore.tab$;
  readonly arguments$ = this._instructionStore.arguments$;
  readonly basicAccounts$ = this._instructionStore.basicAccounts$;
  readonly signerAccounts$ = this._instructionStore.signerAccounts$;
  readonly programAccounts$ = this._instructionStore.programAccounts$;
  readonly accountsCount$ = this._instructionStore.accountsCount$;
  readonly gridCols$ = this._activeBreakpointService.activeBreakpoint$.pipe(
    map((activeBreakpoint) => {
      switch (activeBreakpoint) {
        case 'xs':
          return 1;
        case 'sm':
          return 2;
        case 'md':
        case 'lg':
          return 3;
        default:
          return 4;
      }
    })
  );

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _tabsStore: TabsStore,
    private readonly _walletStore: WalletStore,
    private readonly _activeBreakpointService: ActiveBreakpointService,
    private readonly _instructionStore: InstructionStore
  ) {}

  ngOnInit() {
    this._instructionStore.selectInstruction(
      this._router.events.pipe(
        filter(
          (event): event is NavigationStart => event instanceof NavigationStart
        ),
        map((event) => {
          const urlAsArray = event.url.split('/').filter((segment) => segment);

          if (urlAsArray.length !== 4 || urlAsArray[2] !== 'instructions') {
            return null;
          } else {
            return urlAsArray[3];
          }
        }),
        startWith(this._route.snapshot.paramMap.get('instructionId') || null)
      )
    );
  }

  onReload() {
    this._instructionStore.reload();
  }

  onCreateInstructionArgument() {
    this._instructionStore.createInstructionArgument();
  }

  onEditInstructionArgument(argument: InstructionArgument) {
    this._instructionStore.updateInstructionArgument(argument);
  }

  onDeleteInstructionArgument(argumentId: string) {
    this._instructionStore.deleteInstructionArgument(argumentId);
  }

  onCreateInstructionBasicAccount() {
    this._instructionStore.createInstructionBasicAccount();
  }

  onEditInstructionBasicAccount(account: InstructionBasicAccount) {
    this._instructionStore.updateInstructionBasicAccount(account);
  }

  onDeleteInstructionBasicAccount(accountId: string) {
    this._instructionStore.deleteInstructionBasicAccount(accountId);
  }

  onCreateInstructionSignerAccount() {
    this._instructionStore.createInstructionSignerAccount();
  }

  onEditInstructionSignerAccount(account: InstructionSignerAccount) {
    this._instructionStore.updateInstructionSignerAccount(account);
  }

  onDeleteInstructionSignerAccount(accountId: string) {
    this._instructionStore.deleteInstructionSignerAccount(accountId);
  }

  onCreateInstructionProgramAccount() {
    this._instructionStore.createInstructionProgramAccount();
  }

  onEditInstructionProgramAccount(account: InstructionProgramAccount) {
    this._instructionStore.updateInstructionProgramAccount(account);
  }

  onDeleteInstructionProgramAccount(accountId: string) {
    this._instructionStore.deleteInstructionProgramAccount(accountId);
  }
}
