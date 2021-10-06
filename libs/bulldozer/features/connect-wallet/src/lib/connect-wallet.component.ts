import { Component, HostBinding, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { Wallet } from '@solana/wallet-adapter-wallets';

@Component({
  selector: 'bd-connect-wallet',
  template: `
    <h2 mat-dialog-title>Select Wallet</h2>

    <mat-selection-list
      [multiple]="false"
      (selectionChange)="onSelectionChange($event)"
    >
      <mat-list-option
        *ngFor="let wallet of data.wallets; last as isLast"
        [value]="wallet.name"
        [ngClass]="{
          'bottom-separator': !isLast
        }"
      >
        <div class="flex justify-between items-center">
          <p class="m-0">{{ wallet.name }}</p>
          <img class="w-6 h-6" [src]="wallet.icon | sanitizeUrl" alt="" />
        </div>
      </mat-list-option>
    </mat-selection-list>

    <button
      mat-icon-button
      aria-label="Close connect wallet form"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
})
export class ConnectWalletComponent {
  @HostBinding('class') class = 'block w-64 relative';

  constructor(
    private readonly _matDialogRef: MatDialogRef<ConnectWalletComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      wallets: Wallet[];
    }
  ) {}

  onSelectionChange({ options }: MatSelectionListChange): void {
    const [option] = options;

    this._matDialogRef.close(option.value || null);
  }
}
