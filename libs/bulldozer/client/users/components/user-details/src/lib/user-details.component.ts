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
    <ng-container *ngIf="connected; else notConnected">
      <section *ngIf="user; else userNotDefined">
        <mat-card>
          <header bdSectionHeader>
            <h2>User ID: {{ user.id | obscureAddress }}</h2>
            <p>Visualize your user details.</p>
          </header>

          <p>
            Created at:
            {{ user.createdAt.toNumber() * 1000 | date: 'medium' }}
          </p>

          <button mat-raised-button color="warn" (click)="onDeleteUser()">
            Delete User
          </button>
        </mat-card>
      </section>
    </ng-container>

    <ng-template #notConnected>
      <section>
        <h2>Connect your wallet in order to view your profile.</h2>

        <hd-wallet-multi-button color="primary"></hd-wallet-multi-button>
      </section>
    </ng-template>

    <ng-template #userNotDefined>
      <section>
        <h2>You have no user defined.</h2>

        <button mat-raised-button color="primary" (click)="onCreateUser()">
          Create User
        </button>
      </section>
    </ng-template>
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
