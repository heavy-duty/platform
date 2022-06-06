import {
	ChangeDetectorRef,
	Directive,
	TemplateRef,
	ViewContainerRef,
} from '@angular/core';
import { Wallet, WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { WalletName } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import { tap } from 'rxjs';

export class HdWalletAdapterContext {
	public $implicit!: unknown;
	public wallet!: Wallet | null;
	public connected!: boolean;
	public connecting!: boolean;
	public disconnecting!: boolean;
	public publicKey!: PublicKey | null;
	public wallets!: Wallet[];
	public selectWallet!: (wallet: WalletName | null) => void;
}

interface Changes {
	connected: boolean;
	connecting: boolean;
	disconnecting: boolean;
	wallet: Wallet | null;
	publicKey: PublicKey | null;
	wallets: Wallet[];
}

@Directive({
	selector: '[hdWalletAdapter]',
	standalone: true,
})
export class HdWalletAdapterDirective extends ComponentStore<object> {
	private _context: HdWalletAdapterContext = new HdWalletAdapterContext();
	private readonly _changes$ = this.select(
		this._walletStore.connected$,
		this._walletStore.connecting$,
		this._walletStore.disconnecting$,
		this._walletStore.wallet$,
		this._walletStore.publicKey$,
		this._walletStore.wallets$,
		(connected, connecting, disconnecting, wallet, publicKey, wallets) => ({
			connected,
			connecting,
			disconnecting,
			wallet,
			publicKey,
			wallets,
		})
	);

	constructor(
		private readonly _viewContainerRef: ViewContainerRef,
		private readonly _templateRef: TemplateRef<HdWalletAdapterContext>,
		private readonly _walletStore: WalletStore,
		private readonly _changeDetectionRef: ChangeDetectorRef
	) {
		super({});
		this._viewContainerRef.createEmbeddedView(this._templateRef, this._context);
		this._handleChanges(this._changes$);
	}

	private readonly _handleChanges = this.effect<Changes>(
		tap(
			({
				connected,
				connecting,
				disconnecting,
				wallet,
				publicKey,
				wallets,
			}) => {
				this._context.connected = connected;
				this._context.connecting = connecting;
				this._context.disconnecting = disconnecting;
				this._context.wallet = wallet;
				this._context.publicKey = publicKey;
				this._context.wallets = wallets;
				this._context.selectWallet = (walletName: WalletName | null) =>
					this._walletStore.selectWallet(walletName);
				this._changeDetectionRef.markForCheck();
			}
		)
	);

	static ngTemplateContextGuard(
		_: HdWalletAdapterDirective,
		ctx: unknown
	): ctx is HdWalletAdapterContext {
		return true;
	}
}
