import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BlueprintButtonModule } from '@heavy-duty/blueprint-button';
import { Wallet } from '@heavy-duty/wallet-adapter';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';

@Component({
	selector: 'hd-wallet-modal',
	template: `
		<ng-container *ngIf="installedWallets.length > 0">
			<header>
				<button
					bpButton
					aria-label="Close wallet adapter selection"
					(click)="onClose()"
				>
					<mat-icon>close</mat-icon>
				</button>
				<h2>Connect a wallet on Solana to continue</h2>
			</header>

			<ul>
				<li *ngFor="let wallet of installedWallets">
					<button
						class="w-full px-6 py-2 bg-white bg-opacity-0 hover:bg-opacity-5"
						(click)="onSelectionChange(wallet.adapter.name)"
					>
						<hd-wallet-list-item [wallet]="wallet"></hd-wallet-list-item>
					</button>
				</li>
				<ng-container *ngIf="expanded">
					<li *ngFor="let wallet of otherWallets">
						<button
							class="w-full px-6 py-2 bg-white bg-opacity-0 hover:bg-opacity-5"
							(click)="onSelectionChange(wallet.adapter.name)"
						>
							<hd-wallet-list-item [wallet]="wallet"> </hd-wallet-list-item>
						</button>
					</li>
				</ng-container>
			</ul>

			<button
				*ngIf="otherWallets.length > 0"
				class="toggle-expand"
				bpButton
				(click)="onToggleExpand()"
			>
				<span>
					{{ expanded ? 'Less options' : 'More options' }}
				</span>
				<mat-icon [ngClass]="{ expanded: expanded }"> expand_more </mat-icon>
			</button>
		</ng-container>

		<ng-container *ngIf="installedWallets.length === 0">
			<header>
				<button
					bpButton
					(click)="onClose()"
					aria-label="Close wallet adapter selection"
				>
					<mat-icon>close</mat-icon>
				</button>
				<h2>You'll need a wallet on Solana to continue</h2>
			</header>

			<ul *ngIf="expanded">
				<li *ngFor="let wallet of otherWallets">
					<button
						class="w-full px-6 py-2 bg-white bg-opacity-0 hover:bg-opacity-5"
						(click)="onSelectionChange(wallet.adapter.name)"
					>
						<hd-wallet-list-item [wallet]="wallet"> </hd-wallet-list-item>
					</button>
				</li>
			</ul>

			<button
				*ngIf="otherWallets.length > 0"
				class="toggle-expand"
				bpButton
				(click)="onToggleExpand()"
			>
				<span>
					{{
						expanded ? 'Hide options' : 'Already have a wallet? View options'
					}}
				</span>
				<mat-icon [ngClass]="{ expanded: expanded }"> expand_more </mat-icon>
			</button>
		</ng-container>
	`,
	styles: [
		`
			:host {
				display: block;
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

			.getting-started {
				display: block;
				margin: 2rem auto;
			}

			.toggle-expand {
				display: flex;
				justify-content: space-between;
				margin: 1rem 1rem 1rem auto;
				align-items: center;
			}

			.toggle-expand span {
				margin: 0;
			}

			.toggle-expand mat-icon {
				transition: 500ms cubic-bezier(0.4, 0, 0.2, 1);
			}

			.toggle-expand mat-icon.expanded {
				transform: rotate(180deg);
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [
		CommonModule,
		HdWalletAdapterCdkModule,
		BlueprintButtonModule,
		MatIconModule,
	],
})
export class HdWalletModalComponent {
	readonly installedWallets: Wallet[];
	readonly otherWallets: Wallet[];
	readonly getStartedWallet: Wallet;
	expanded = false;

	constructor(
		private readonly _dialogRef: DialogRef<WalletName, HdWalletModalComponent>,
		@Inject(DIALOG_DATA) data: { wallets: Wallet[] }
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
						wallet.adapter.name === 'Phantom'
			  ) ||
			  data.wallets.find(
					(wallet: { adapter: { name: WalletName } }) =>
						wallet.adapter.name === 'Torus'
			  ) ||
			  data.wallets.find(
					(wallet: { readyState: WalletReadyState }) =>
						wallet.readyState === WalletReadyState.Loadable
			  ) ||
			  this.otherWallets[0];
	}

	onSelectionChange(walletName: WalletName): void {
		this._dialogRef.close(walletName);
	}

	onGettingStarted(): void {
		this._dialogRef.close(this.getStartedWallet.adapter.name);
	}

	onClose(): void {
		this._dialogRef.close();
	}

	onToggleExpand(): void {
		this.expanded = !this.expanded;
	}
}
