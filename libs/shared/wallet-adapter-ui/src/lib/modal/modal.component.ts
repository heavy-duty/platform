import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  ViewChild,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import {
  MatSelectionList,
  MatSelectionListChange,
} from '@angular/material/list';
import { Wallet } from '@heavy-duty/wallet-adapter';
import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';

@Component({
  selector: 'hd-wallet-modal',
  template: `
    <ng-container *ngIf="installedWallets.length > 0">
      <header>
        <button
          mat-icon-button
          mat-dialog-close
          aria-label="Close wallet adapter selection"
        >
          <mat-icon>close</mat-icon>
        </button>
        <h2>Connect a wallet on Solana to continue</h2>
      </header>

      <mat-selection-list
        [multiple]="false"
        (selectionChange)="onSelectionChange($event)"
      >
        <mat-list-option
          *ngFor="let wallet of installedWallets"
          [value]="wallet.adapter.name"
        >
          <hd-wallet-list-item [wallet]="wallet"></hd-wallet-list-item>
        </mat-list-option>
        <mat-expansion-panel class="mat-elevation-z0" disabled>
          <ng-template matExpansionPanelContent>
            <mat-list-option
              *ngFor="let wallet of otherWallets"
              [value]="wallet.adapter.name"
            >
              <hd-wallet-list-item [wallet]="wallet"> </hd-wallet-list-item>
            </mat-list-option>
          </ng-template>
        </mat-expansion-panel>
      </mat-selection-list>

      <button
        *ngIf="otherWallets.length > 0"
        class="toggle-expand"
        (click)="onToggleExpand()"
        mat-stroked-button
      >
        <hd-wallet-expand [expanded]="matExpansionPanel?.expanded || null">
        </hd-wallet-expand>
      </button>
    </ng-container>

    <ng-container *ngIf="installedWallets.length === 0">
      <header>
        <button
          mat-icon-button
          mat-dialog-close
          aria-label="Close wallet adapter selection"
        >
          <mat-icon>close</mat-icon>
        </button>
        <h2>You'll need a wallet on Solana to continue</h2>
      </header>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 280px;
      }

      .mat-dialog-title {
        margin: 0;
      }

      header {
        margin-bottom: 2.5rem;
      }

      header h2 {
        font-size: 1.5rem;
        text-align: center;
        padding: 0 3rem;
        font-weight: bold;
      }

      header button {
        display: block;
        margin-left: auto;
        margin-right: 1rem;
        margin-top: 1rem;
      }

      .toggle-expand {
        display: block;
        margin: 1rem 1rem 1rem auto;
      }

      .mat-list-base {
        padding: 0 !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletModalComponent {
  @ViewChild(MatSelectionList) matSelectionList: MatSelectionList | null = null;
  @ViewChild(MatExpansionPanel) matExpansionPanel: MatExpansionPanel | null =
    null;
  readonly installedWallets: Wallet[];
  readonly otherWallets: Wallet[];
  readonly getStartedWallet: Wallet;

  constructor(
    private readonly _matDialogRef: MatDialogRef<
      WalletModalComponent,
      WalletName
    >,
    @Inject(MAT_DIALOG_DATA) data: { wallets: Wallet[]; featured: number }
  ) {
    this.installedWallets = data.wallets.filter(
      (wallet) => wallet.readyState === WalletReadyState.Installed
    );
    this.otherWallets = [
      ...data.wallets.filter(
        (wallet) => wallet.readyState === WalletReadyState.Loadable
      ),
      ...data.wallets.filter(
        (wallet) => wallet.readyState === WalletReadyState.NotDetected
      ),
    ];
    this.getStartedWallet = this.installedWallets.length
      ? this.installedWallets[0]
      : data.wallets.find(
          (wallet: { adapter: { name: WalletName } }) =>
            wallet.adapter.name === 'Torus'
        ) ||
        data.wallets.find(
          (wallet: { adapter: { name: WalletName } }) =>
            wallet.adapter.name === 'Phantom'
        ) ||
        data.wallets.find(
          (wallet: { readyState: WalletReadyState }) =>
            wallet.readyState === WalletReadyState.Loadable
        ) ||
        this.otherWallets[0];
  }

  onSelectionChange({ options }: MatSelectionListChange): void {
    const [option] = options;
    this._matDialogRef.close(option.value);
  }

  onToggleExpand() {
    this.matExpansionPanel?.toggle();
  }
}
