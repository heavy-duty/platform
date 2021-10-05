import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { ConnectWalletComponent } from '@heavy-duty/bulldozer/features/connect-wallet';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'bd-navigation',
  template: `
    <mat-sidenav-container class="h-full" fullscreen>
      <mat-sidenav
        #drawer
        class="sidenav"
        fixedInViewport
        [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="(isHandset$ | async) === false"
      >
        <figure class="mt-4 w-full flex justify-center">
          <img src="assets/images/logo.png" class="w-4/6" />
        </figure>
        <mat-nav-list></mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="drawer.toggle()"
            *ngIf="isHandset$ | async"
          >
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>
          <ng-container *ngrxLet="connected$; let connected">
            <div *ngIf="!connected" class="ml-auto">
              <button mat-raised-button color="accent" (click)="onConnect()">
                Connect
              </button>
            </div>

            <div *ngIf="connected" class="ml-auto flex items-center">
              <ng-container *ngIf="address$ | ngrxPush as address">
                {{ address | obscureAddress }}
              </ng-container>
              <button
                mat-raised-button
                color="warn"
                class="ml-4"
                (click)="onDisconnect()"
              >
                Disconnect
              </button>
            </div>
          </ng-container>
        </mat-toolbar>
        <ng-content></ng-content>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .sidenav {
        width: 200px;
      }

      .sidenav .mat-toolbar {
        background: inherit;
      }

      .mat-toolbar.mat-primary {
        position: sticky;
        top: 0;
        z-index: 1;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent {
  readonly isHandset$: Observable<boolean> = this._breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
  readonly connected$ = this._walletStore.connected$;
  readonly address$ = this._walletStore.publicKey$.pipe(
    isNotNullOrUndefined,
    map((publicKey) => publicKey.toBase58())
  );

  constructor(
    private readonly _breakpointObserver: BreakpointObserver,
    private readonly _walletStore: WalletStore,
    private readonly _matDialog: MatDialog
  ) {}

  onConnect() {
    this._matDialog.open(ConnectWalletComponent);
  }

  onDisconnect() {
    if (confirm('Are you sure?')) {
      this._walletStore.disconnect().subscribe();
    }
  }
}
