import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { UserView } from '@bulldozer-client/users-data-access';

@Component({
  selector: 'bd-user-details',
  template: `
    <div>
      <section class="flex flex-col gap-3">
        <ng-container *ngIf="connected">
          <ng-container *ngIf="user; else userNotDefined">
            <header bdSectionHeader>
              <h2 class="flex items-center justify-start gap-2">
                <span
                  [matTooltip]="
                    user.document.id | bdItemUpdatingMessage: user:'User'
                  "
                  matTooltipShowDelay="500"
                >
                  User ID: {{ user.document.id | obscureAddress }}
                </span>
                <mat-progress-spinner
                  *ngIf="user | bdItemShowSpinner"
                  diameter="16"
                  mode="indeterminate"
                ></mat-progress-spinner>
              </h2>

              <p>Visualize your user details.</p>
            </header>

            <p class="m-0" *ngIf="!user.isCreating && !user.isDeleting">
              Created at:
              {{ user.document.createdAt.toNumber() * 1000 | date: 'medium' }}
            </p>

            <footer>
              <button
                mat-raised-button
                color="warn"
                (click)="onDeleteUser()"
                [disabled]="user.isCreating || user.isDeleting"
              >
                Delete User
              </button>
            </footer>
          </ng-container>
        </ng-container>

        <ng-template #userNotDefined>
          <section class="flex flex-col">
            <h3 class="mb-3">You have no user defined.</h3>

            <footer>
              <button
                mat-raised-button
                color="primary"
                (click)="onCreateUser()"
                [disabled]="user !== null && user.isCreating"
              >
                Create User
              </button>
            </footer>
          </section>
        </ng-template>
      </section>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsComponent {
  @Input() connected = false;
  @Input() user: UserView | null = null;
  @Output() createUser = new EventEmitter();
  @Output() deleteUser = new EventEmitter();

  onCreateUser() {
    this.createUser.emit();
  }

  onDeleteUser() {
    this.deleteUser.emit();
  }
}
