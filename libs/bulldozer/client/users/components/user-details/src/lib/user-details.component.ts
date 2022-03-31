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
    <section class="flex flex-col gap-3" *ngIf="connected">
      <div
        class="flex justify-between items-center"
        *ngIf="user; else userNotDefined"
      >
        <div class="flex items-center">
          <figure class="w-20 m-auto relative mr-5">
            <img src="assets/images/default-profile.png" class="w-full" />
          </figure>
          <div>
            <h2 class="flex items-center justify-start gap-2 mb-0">
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

            <div class="flex">
              <mat-icon class="text-sm w-4 mr-1">event</mat-icon>
              <p class="m-0" *ngIf="!user.isCreating && !user.isDeleting">
                Builder since
                {{
                  user.document.createdAt.toNumber() * 1000 | date: 'mediumDate'
                }}
              </p>
            </div>
          </div>
        </div>
        <div>
          <button
            mat-raised-button
            color="warn"
            (click)="onDeleteUser()"
            [disabled]="user.isCreating || user.isDeleting"
          >
            Delete User
          </button>
        </div>
      </div>

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
