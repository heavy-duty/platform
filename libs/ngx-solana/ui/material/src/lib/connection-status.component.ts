import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'hd-connection-status',
  template: `
    <p class="m-0 text-xs">
      <span [ngClass]="{ 'text-green-500': online, 'text-red-500': !online }">
        {{ online ? 'Online' : 'Offline' }}
      </span>
      since
      <span class="text-primary">
        {{ (online ? onlineSince : offlineSince) | date: 'short' }}
      </span>
    </p>

    <p class="m-0 text-xs" *ngIf="online && connected">
      <span class="text-green-500">Connected</span> since
      <span class="text-primary">
        {{ connectedAt | date: 'short' }}
      </span>
    </p>

    <p class="m-0 text-xs" *ngIf="online && !connected && !connecting">
      <ng-container *ngIf="nextAttemptRelativeTime; else reconnecting">
        Reconnecting in
        <span class="text-primary">{{ nextAttemptRelativeTime }}</span
        >.
        <button (click)="reconnect.emit()" class="underline text-primary">
          (Reconnect now)
        </button>
      </ng-container>
      <ng-template #reconnecting> Reconnecting... </ng-template>
    </p>
  `,
})
export class HdConnectionStatusComponent {
  @Input() online!: boolean;
  @Input() connected!: boolean;
  @Input() connecting!: boolean;
  @Input() onlineSince: number | null = null;
  @Input() offlineSince: number | null = null;
  @Input() connectedAt: number | null = null;
  @Input() nextAttemptRelativeTime: string | null = null;
  @Output() reconnect = new EventEmitter();
}
