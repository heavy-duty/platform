import {
  ChangeDetectorRef,
  Directive,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Wallet, WalletStore } from '@heavy-duty/wallet-adapter';
import { WalletName } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import { combineLatest, Subject, takeUntil } from 'rxjs';

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

@Directive({
  selector: '[hdWalletAdapter]',
})
export class HdWalletAdapterDirective implements OnInit, OnDestroy {
  private _context: HdWalletAdapterContext = new HdWalletAdapterContext();
  private _destroy = new Subject();

  constructor(
    private readonly _viewContainerRef: ViewContainerRef,
    private readonly _templateRef: TemplateRef<HdWalletAdapterContext>,
    private readonly _walletStore: WalletStore,
    private readonly _changeDetectionRef: ChangeDetectorRef
  ) {
    this._viewContainerRef.createEmbeddedView(this._templateRef, this._context);
  }

  static ngTemplateContextGuard(
    _: HdWalletAdapterDirective,
    ctx: unknown
  ): ctx is HdWalletAdapterContext {
    return true;
  }

  ngOnInit() {
    combineLatest([
      this._walletStore.connected$,
      this._walletStore.connecting$,
      this._walletStore.disconnecting$,
      this._walletStore.wallet$,
      this._walletStore.publicKey$,
      this._walletStore.wallets$,
    ])
      .pipe(takeUntil(this._destroy))
      .subscribe(
        ([
          connected,
          connecting,
          disconnecting,
          wallet,
          publicKey,
          wallets,
        ]) => {
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
      );
  }

  ngOnDestroy() {
    this._destroy.next(null);
    this._destroy.complete();
  }
}
