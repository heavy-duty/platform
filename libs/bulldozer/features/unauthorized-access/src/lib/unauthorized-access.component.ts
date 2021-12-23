import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { Subject } from 'rxjs';
import { filter, takeUntil, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'bd-unauthorized-access',
  template: `
    <header class="mt-16 flex justify-center flex-wrap">
      <figure class="mb-4 w-40">
        <img src="assets/images/logo.png" class="w-full" />
      </figure>
      <h1 class="w-full text-center">BULLDOZER</h1>
      <p class="w-full text-center">Connect your wallet to start building</p>
    </header>
    <main class="flex justify-center">
      <hd-wallet-multi-button color="primary"></hd-wallet-multi-button>
    </main>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedAccessComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'block';
  private readonly _destroy = new Subject();
  private readonly _destroy$ = this._destroy.asObservable();

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this._walletStore.connected$
      .pipe(
        filter((connected) => connected),
        withLatestFrom(
          this._activatedRoute.queryParamMap,
          (_, queryParamMap) => queryParamMap.get('redirect') || '/'
        ),
        takeUntil(this._destroy$)
      )
      .subscribe((redirectUrl) => this._router.navigateByUrl(redirectUrl));
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
