import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { InstructionAccountExtended } from '@heavy-duty/bulldozer/application/utils/types';

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
          *ngIf="accounts !== null && accounts.length > 0; else emptyList"
          role="list"
        >
          <mat-list-item
            role="listitem"
            *ngFor="let account of accounts"
            class="h-20 bg-black bg-opacity-10 mb-2 last:mb-0"
          >
            <div class="flex items-center gap-4 w-full">
              <div
                class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
                [ngSwitch]="account.data.kind.id"
              >
                <mat-icon *ngSwitchCase="0">description</mat-icon>
                <mat-icon *ngSwitchCase="1">group_work</mat-icon>
                <mat-icon *ngSwitchCase="2">rate_review</mat-icon>
              </div>

              <div class="flex-grow">
                <h3 class="mb-0 text-lg font-bold">
                  {{ account.data.name }}

                  <span
                    class="text-xs font-thin"
                    [ngSwitch]="account.data.modifier.id"
                  >
                    <ng-container *ngSwitchCase="1">
                      ({{ account.data.modifier.name }}: space
                      {{ account.data.space }})
                    </ng-container>
                    <ng-container *ngSwitchCase="2">
                      ({{ account.data.modifier.name }})
                    </ng-container>
                  </span>
                </h3>
                <p class="text-xs mb-0 italic" *ngIf="account.data.collection">
                  Collection:
                  {{ account.data.collection.data.name }}
                  <a
                    class="underline text-accent"
                    [routerLink]="[
                      '/applications',
                      account.data.application,
                      'collections',
                      account.data.collection.id
                    ]"
                    >{{ account.data.collection.id | obscureAddress }}</a
                  >
                </p>
                <p class="text-xs mb-0 italic" *ngIf="account.data.program">
                  Program:
                  {{ account.data.program | obscureAddress }}
                </p>
                <p class="text-xs mb-0 italic" *ngIf="account.data.close">
                  Close:
                  {{ account.data.close.data.name }} ({{
                    account.data.close.id | obscureAddress
                  }})
                </p>
                <p class="text-xs mb-0 italic" *ngIf="account.data.payer">
                  Payer:
                  {{ account.data.payer.data.name }} ({{
                    account.data.payer.id | obscureAddress
                  }})
                </p>
              </div>

              <button
                mat-mini-fab
                color="primary"
                aria-label="Account menu"
                [matMenuTriggerFor]="accountMenu"
              >
                <mat-icon>more_horiz</mat-icon>
              </button>
              <mat-menu #accountMenu="matMenu">
                <button
                  mat-menu-item
                  (click)="onUpdateAccount(account)"
                  [disabled]="!connected"
                >
                  <mat-icon>edit</mat-icon>
                  <span>Update account</span>
                </button>
                <button
                  mat-menu-item
                  (click)="onDeleteAccount(account.id)"
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
  @Input() accounts: InstructionAccountExtended[] | null = null;
  @Output() updateBasicAccount = new EventEmitter<InstructionAccountExtended>();
  @Output() updateSignerAccount =
    new EventEmitter<InstructionAccountExtended>();
  @Output() updateProgramAccount =
    new EventEmitter<InstructionAccountExtended>();
  @Output() updateAccount = new EventEmitter<InstructionAccountExtended>();
  @Output() deleteAccount = new EventEmitter<string>();

  onUpdateAccount(account: InstructionAccountExtended) {
    switch (account.data.kind.id) {
      case 0:
        return this.updateBasicAccount.emit(account);
      case 1:
        return this.updateProgramAccount.emit(account);
      case 2:
        return this.updateSignerAccount.emit(account);
      default:
        return null;
    }
  }

  onDeleteAccount(accountId: string) {
    this.deleteAccount.emit(accountId);
  }
}
