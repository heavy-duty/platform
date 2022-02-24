import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Document, User } from '@heavy-duty/bulldozer-devkit';

@Component({
  selector: 'bd-user-details',
  template: `
    <mat-card class="p-3">
      <section class="flex flex-col gap-3">
        <ng-container *ngIf="connected; else notConnected">
          <ng-container *ngIf="user; else userNotDefined">
            <header bdSectionHeader>
              <h2>User ID: {{ user.id | obscureAddress }}</h2>
              <p>Visualize your user details.</p>
            </header>

            <p class="m-0">
              Created at:
              {{ user.createdAt.toNumber() * 1000 | date: 'medium' }}
            </p>

            <footer>
              <button mat-raised-button color="warn" (click)="onDeleteUser()">
                Delete User
              </button>
            </footer>
          </ng-container>
        </ng-container>

        <ng-template #notConnected>
          <section class="flex flex-col gap-3">
            <h2>Connect your wallet in order to view your profile.</h2>

            <footer>
              <hd-wallet-multi-button color="primary"></hd-wallet-multi-button>
            </footer>
          </section>
        </ng-template>

        <ng-template #userNotDefined>
          <section class="flex flex-col gap-3">
            <h2>You have no user defined.</h2>

            <footer>
              <button
                mat-raised-button
                color="primary"
                (click)="onCreateUser()"
              >
                Create User
              </button>
            </footer>
          </section>
        </ng-template>
      </section>
    </mat-card>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsComponent {
  @Input() connected = false;
  @Input() user: Document<User> | null = null;
  @Output() createUser = new EventEmitter();
  @Output() deleteUser = new EventEmitter();

  onCreateUser() {
    this.createUser.emit();
  }

  onDeleteUser() {
    this.deleteUser.emit();
  }
}
