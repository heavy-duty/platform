import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { filter, Subject, takeUntil, withLatestFrom } from 'rxjs';

// <header class="mt-16 flex justify-center flex-wrap">
//    <figure class="mb-4 w-80">
//      <img src="assets/images/logo.png" class="w-full" />
//    </figure>
//    <h1 class="w-full text-center">BULLDOZER</h1>
//    <p class="w-full text-center">Connect your wallet to start building</p>
// </header>
// <main class="flex justify-center">
//    <hd-wallet-multi-button color="primary"></hd-wallet-multi-button>
// </main>

@Component({
  selector: 'bd-unauthorized-access',
  template: `
    <main class="flex h-screen">
      <div class="bd-bg-black w-1/2 h-screen flex justify-end items-center">
        <div class="content mr-16 hd-scroll-mt-8">
          <figure class="mb-4 w-32">
            <img src="assets/images/logo.png" class="w-full" />
          </figure>
          <h2 class="mb-1 font-bold">BULLDOZER</h2>
          <p class="mb-7">Connect your wallet to start building</p>
          <hd-wallet-multi-button
            class="text-white"
            color="primary"
          ></hd-wallet-multi-button>
        </div>
      </div>
      <div class="hd-side-right w-1/2 h-screen flex justify-start items-center">
        <div class="content ml-16 w-96 hd-scroll-mt-8">
          <h2 class="font-bold">WELCOME</h2>
          <p>
            Bulldozer is a open source low code platform to build Solana
            programs. It gives developers the ability to manage their program’s
            ecosystem through a UI, hiding all the gory details.
          </p>
          <div class="flex mt-6">
            <figure class="w-8 mr-4">
              <a href="https://github.com/heavy-duty/platform" target="_blank">
                <img src="assets/images/social/github.png" class="w-full" />
              </a>
            </figure>
            <figure class="w-8 mr-4">
              <a href="https://discord.gg/Ej47EUAj4u" target="_blank">
                <img src="assets/images/social/discord.png" class="w-full" />
              </a>
            </figure>
            <figure class="w-8 mr-4">
              <a href="https://twitter.com/HeavyDutyBuild" target="_blank">
                <img src="assets/images/social/twitter.png" class="w-full" />
              </a>
            </figure>
          </div>
        </div>
      </div>
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
    this._destroy.next(null);
    this._destroy.complete();
  }
}
