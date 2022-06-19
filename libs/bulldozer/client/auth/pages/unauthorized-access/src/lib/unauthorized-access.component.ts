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

@Component({
	selector: 'bd-unauthorized-access',
	template: `
		<main class="flex h-screen">
			<div
				class="bg-bd-black w-1/2 h-screen flex flex-col justify-end items-center bd-bg-bricks"
			>
				<div class="w-full">
					<div
						class="ml-5 mt-5 box-border w-24 flex flex-col justify-center items-center"
					>
						<figure>
							<img
								src="assets/images/logo.webp"
								alt="HeavyDuty logo"
								width="128"
								height="144"
							/>
						</figure>
						<p class="mb-1 bp-font text-base">BULLDOZER</p>
					</div>
				</div>
				<div class="flex-grow w-full flex justify-center items-center">
					<div class="content w-96 -mt-28">
						<h1 class="bp-font ">WELCOME</h1>
						<p>
							Bulldozer is a open source low code platform to build Solana
							programs. It gives developers the ability to manage their
							program’s ecosystem through a UI, hiding all the gory details.
						</p>
						<div class="flex mt-6 mb-10">
							<figure class="mr-4">
								<a
									href="https://github.com/heavy-duty/platform"
									target="_blank"
								>
									<img
										class="w-8 h-8"
										src="assets/images/social/github.png"
										alt="Github button"
										width="32"
										height="32"
									/>
								</a>
							</figure>
							<figure class="mr-4">
								<a href="https://discord.gg/Ej47EUAj4u" target="_blank">
									<img
										class="w-8 h-8"
										src="assets/images/social/discord.png"
										alt="Discord button"
										width="32"
										height="32"
									/>
								</a>
							</figure>
							<figure class="mr-4">
								<a href="https://twitter.com/HeavyDutyBuild" target="_blank">
									<img
										class="w-8 h-8"
										src="assets/images/social/twitter.png"
										alt="Twitter button"
										width="32"
										height="32"
									/>
								</a>
							</figure>
						</div>
						<div
							*hdWalletAdapter="
								let wallet = wallet;
								let wallets = wallets;
								let publicKey = publicKey;
								let selectWallet = selectWallet
							"
							class="py-4 px-7 w-48 h-16 flex justify-center items-center m-auto bd-bg-metal-2 shadow relative"
						>
							<hd-wallet-modal-button class="flex-1">
								<ng-container #children> Start Building </ng-container>
							</hd-wallet-modal-button>
							<div
								class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-7 left-2"
							>
								<div class="w-full h-px bg-gray-600 rotate-45"></div>
							</div>
							<div
								class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-7 right-2"
							>
								<div class="w-full h-px bg-gray-600"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div
				class="hd-side-right w-1/2 h-screen flex justify-start items-center bd-bg-bulldozer"
			></div>
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
