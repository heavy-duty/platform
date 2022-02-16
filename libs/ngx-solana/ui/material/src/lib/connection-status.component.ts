import { Component } from '@angular/core';

@Component({
  selector: 'hd-connection-status',
  template: `
    <ng-container
      *hdSolanaConnection="
        let online = online;
        let connected = connected;
        let connecting = connecting;
        let onlineSince = onlineSince;
        let offlineSince = offlineSince;
        let connectedAt = connectedAt
      "
    >
      <p class="m-0 text-xs">
        <span [ngClass]="{ 'text-green-500': online, 'text-red-500': !online }">
          {{ online ? 'Online' : 'Offline' }}
        </span>
        since
        <span class="text-primary">
          {{ (online ? onlineSince : offlineSince) | date: 'short' }}
        </span>
      </p>

      <ng-container *ngIf="online">
        <p class="m-0 text-xs" *ngIf="connected">
          <span class="text-green-500">Connected</span> since
          <span class="text-primary">
            {{ connectedAt | date: 'short' }}
          </span>
        </p>

        <p class="m-0 text-xs" *ngIf="!connected && !connecting">
          <ng-container
            *hdSolanaConnection="
              let nextAttemptAt = nextAttemptAt;
              let reconnect = reconnect
            "
          >
            <ng-container
              *ngIf="
                nextAttemptAt | hdRelativeTime | async as timeToNextAttempt;
                else reconnecting
              "
            >
              Reconnecting in
              <span class="text-primary">{{ timeToNextAttempt }}</span
              >.
              <button (click)="reconnect()" class="underline text-primary">
                (Reconnect now)
              </button>
            </ng-container>
            <ng-template #reconnecting> Reconnecting... </ng-template>
          </ng-container>
        </p>
      </ng-container>
    </ng-container>
  `,
})
export class HdConnectionStatusComponent {}
