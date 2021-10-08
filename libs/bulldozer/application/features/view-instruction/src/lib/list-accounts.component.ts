import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  InstructionBasicAccount,
  InstructionProgramAccount,
  InstructionSignerAccount,
} from '@heavy-duty/bulldozer/data-access';

@Component({
  selector: 'bd-list-accounts',
  template: `
    <section>
      <mat-card>
        <header bdSectionHeader>
          <h2>Accounts</h2>
          <p>Visualize the list of accounts and manage them.</p>
        </header>

        <mat-list
          role="list"
          *ngIf="accountsCount !== null && accountsCount > 0; else emptyList"
        >
          <mat-list-item
            role="listitem"
            *ngFor="let account of basicAccounts"
            class="h-20 bg-black bg-opacity-10 mb-2 last:mb-0"
          >
            <div class="flex items-center gap-4 w-full">
              <div
                class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
              >
                <mat-icon>description</mat-icon>
              </div>

              <div class="flex-grow">
                <h3 class="mb-0 text-lg font-bold">
                  {{ account.data.name }}
                </h3>
                <p class="text-xs mb-0 italic">
                  Collection:
                  <a
                    class="underline text-accent"
                    [routerLink]="[
                      '/applications',
                      account.data.application,
                      'collections',
                      account.data.collection
                    ]"
                    >{{ account.data.collection | obscureAddress }}</a
                  >
                </p>
                <p class="text-xs mb-0 italic">
                  Constraints: {{ account.data.markAttribute.name }}
                </p>
              </div>

              <button
                mat-mini-fab
                color="primary"
                aria-label="Basic account menu"
                [matMenuTriggerFor]="basicAccountMenu"
              >
                <mat-icon>more_horiz</mat-icon>
              </button>
              <mat-menu #basicAccountMenu="matMenu">
                <button
                  mat-menu-item
                  (click)="onUpdateBasicAccount(account)"
                  [disabled]="!connected"
                >
                  <mat-icon>edit</mat-icon>
                  <span>Update account</span>
                </button>
                <button
                  mat-menu-item
                  (click)="onDeleteBasicAccount(account.id)"
                  [disabled]="!connected"
                >
                  <mat-icon>delete</mat-icon>
                  <span>Delete account</span>
                </button>
              </mat-menu>
            </div>
          </mat-list-item>

          <mat-list-item
            role="listitem"
            *ngFor="let account of signerAccounts"
            class="h-20 bg-black bg-opacity-10 mb-2 last:mb-0"
          >
            <div class="flex items-center gap-4 w-full">
              <div
                class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
              >
                <mat-icon>rate_review</mat-icon>
              </div>

              <div class="flex-grow">
                <h3 class="mb-0 text-lg font-bold">
                  {{ account.data.name }}
                </h3>
                <p class="text-xs mb-0 italic">
                  Constraints: {{ account.data.markAttribute.name }}
                </p>
              </div>

              <button
                mat-mini-fab
                color="primary"
                aria-label="Signer account menu"
                [matMenuTriggerFor]="signerAccountMenu"
              >
                <mat-icon>more_horiz</mat-icon>
              </button>
              <mat-menu #signerAccountMenu="matMenu">
                <button
                  mat-menu-item
                  (click)="onUpdateSignerAccount(account)"
                  [disabled]="!connected"
                >
                  <mat-icon>edit</mat-icon>
                  <span>Update account</span>
                </button>
                <button
                  mat-menu-item
                  (click)="onDeleteSignerAccount(account.id)"
                  [disabled]="!connected"
                >
                  <mat-icon>delete</mat-icon>
                  <span>Delete account</span>
                </button>
              </mat-menu>
            </div>
          </mat-list-item>

          <mat-list-item
            role="listitem"
            *ngFor="let account of programAccounts"
            class="h-20 bg-black bg-opacity-10 mb-2 last:mb-0"
          >
            <div class="flex items-center gap-4 w-full">
              <div
                class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
              >
                <mat-icon>group_work</mat-icon>
              </div>

              <div class="flex-grow">
                <h3 class="mb-0 text-lg font-bold">
                  {{ account.data.name }}
                </h3>
                <p class="text-xs mb-0 italic">
                  Program: {{ account.data.program | obscureAddress }}
                </p>
              </div>

              <button
                mat-mini-fab
                color="primary"
                aria-label="Program account menu"
                [matMenuTriggerFor]="programAccountMenu"
              >
                <mat-icon>more_horiz</mat-icon>
              </button>
              <mat-menu #programAccountMenu="matMenu">
                <button
                  mat-menu-item
                  (click)="onUpdateProgramAccount(account)"
                  [disabled]="!connected"
                >
                  <mat-icon>edit</mat-icon>
                  <span>Update account</span>
                </button>
                <button
                  mat-menu-item
                  (click)="onDeleteProgramAccount(account.id)"
                  [disabled]="!connected"
                >
                  <mat-icon>delete</mat-icon>
                  <span>Delete account</span>
                </button>
              </mat-menu>
            </div>
          </mat-list-item>
        </mat-list>

        <ng-template #emptyList>
          <p class="text-center text-xl py-8">There's no accounts yet.</p>
        </ng-template>
      </mat-card>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListAccountsComponent {
  @Input() connected: boolean | null = null;
  @Input() basicAccounts: InstructionBasicAccount[] | null = null;
  @Input() signerAccounts: InstructionSignerAccount[] | null = null;
  @Input() programAccounts: InstructionProgramAccount[] | null = null;
  @Input() accountsCount: number | null = null;
  @Output() updateBasicAccount = new EventEmitter<InstructionBasicAccount>();
  @Output() deleteBasicAccount = new EventEmitter<string>();
  @Output() updateSignerAccount = new EventEmitter<InstructionSignerAccount>();
  @Output() deleteSignerAccount = new EventEmitter<string>();
  @Output() updateProgramAccount =
    new EventEmitter<InstructionProgramAccount>();
  @Output() deleteProgramAccount = new EventEmitter<string>();

  onUpdateBasicAccount(account: InstructionBasicAccount) {
    this.updateBasicAccount.emit(account);
  }

  onDeleteBasicAccount(accountId: string) {
    this.deleteBasicAccount.emit(accountId);
  }

  onUpdateSignerAccount(account: InstructionSignerAccount) {
    this.updateSignerAccount.emit(account);
  }

  onDeleteSignerAccount(accountId: string) {
    this.deleteSignerAccount.emit(accountId);
  }

  onUpdateProgramAccount(account: InstructionProgramAccount) {
    this.updateProgramAccount.emit(account);
  }

  onDeleteProgramAccount(accountId: string) {
    this.deleteProgramAccount.emit(accountId);
  }
}
