import {
	Component,
	Directive,
	ElementRef,
	HostBinding,
	Input,
	OnInit,
	Renderer2,
} from '@angular/core';
import { BoardPageStore, BountyViewModel } from './board-page.store';
import { BoardStore } from './board.store';
import { BountiesStore } from './bounties.store';
import { IssuesStore } from './issues.store';
import { RepositoryStore } from './repository.store';

@Directive({ selector: '[drillRotate]' })
export class RotateDirective implements OnInit {
	@Input() set angle(value: number) {
		this.rotateElement(value);
	}

	constructor(
		private readonly el: ElementRef,
		private readonly renderer2: Renderer2
	) {}

	ngOnInit() {
		this.rotateElement(Math.floor(Math.random() * 361));
	}

	private rotateElement(value: number) {
		this.renderer2.setStyle(
			this.el.nativeElement,
			'transform',
			`rotate(${value}deg)`
		);
	}
}

@Component({
	selector: 'drill-screwed-card',
	template: `
		<div>
			<ng-content></ng-content>
		</div>

		<div
			*ngFor="let screw of screws"
			class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute"
			[ngClass]="screw"
		>
			<div class="w-full h-px bg-gray-600" drillRotate></div>
		</div>
	`,
})
export class ScrewedCardComponent {
	@HostBinding('class') class = 'block bp-bg-metal-2 bg-black relative';
	@Input() screws = [
		'top-2 left-2',
		'top-2 right-2',
		'bottom-2 left-2',
		'bottom-2 right-2',
	];
}

@Component({
	selector: 'drill-board-page',
	template: `
		<header class="py-8 bp-bg-concrete bg-black rounded">
			<h1 class="text-center">
				<span class="text-3xl bp-font">Bounty Board</span>

				<br />

				<a
					*ngIf="board$ | async as board"
					[href]="board.htmlUrl"
					target="_blank"
					class="underline bp-color-primary"
				>
					@{{ board.fullName }}
				</a>
			</h1>
			<p class="text-center">
				Do you have what it takes? Pick a bounty and make a name for yourself.
			</p>
		</header>

		<main class="p-8">
			<section *ngIf="bounties$ | async as bounties">
				<article
					*ngFor="let bounty of bounties; trackBy: trackBy"
					class="bp-bg-metal bg-black p-4 flex gap-4 mx-auto mt-10 rounded"
					style="max-width: 900px"
				>
					<div class="flex flex-col gap-4 flex-1">
						<drill-screwed-card class="p-6 rounded">
							<h2 class="text-2xl">{{ bounty.title }}</h2>
							<p
								class="h-16"
								[ngClass]="{ 'italic text-gray-400': bounty.body === null }"
							>
								<ng-container *ngIf="bounty.body !== null; else noneBody">
									{{ bounty.body }}
								</ng-container>
								<ng-template #noneBody> No description provided. </ng-template>
							</p>
							<a [href]="bounty.htmlUrl" class="underline"
								>View details in GitHub</a
							>
						</drill-screwed-card>

						<drill-screwed-card class="rounded">
							<a
								class="flex items-center gap-4 px-6 py-4"
								[href]="bounty.creator.htmlUrl"
								target="_blank"
							>
								<img
									class="w-8 h-8 rounded-full"
									[src]="bounty.creator.avatarUrl"
								/>

								<div>
									<p class="text-lg">@{{ bounty.creator.login }}</p>
									<p class="text-xs uppercase bp-color-primary">Creator</p>
								</div>
							</a>
						</drill-screwed-card>

						<drill-screwed-card *ngIf="bounty.hunter !== null" class="rounded">
							<a
								class="flex items-center gap-4 px-6 py-4"
								[href]="bounty.hunter.htmlUrl"
								target="_blank"
							>
								<img
									class="w-8 h-8 rounded-full"
									[src]="bounty.hunter.avatarUrl"
								/>

								<div>
									<p class="text-lg">@{{ bounty.hunter.login }}</p>
									<p class="text-xs uppercase bp-color-primary">Hunter</p>
								</div>
							</a>
						</drill-screwed-card>
					</div>

					<div class="flex flex-col gap-4 w-2/5">
						<drill-screwed-card class="p-6 rounded">
							<p class="p-4 text-center text-3xl bp-font bp-color-primary">
								Bounty
							</p>

							<p class="p-4 bg-black bg-opacity-25 text-2xl text-center">
								{{ bounty.bounty?.vault?.amount }}
							</p>
						</drill-screwed-card>

						<drill-screwed-card class="px-6 py-4">
							<button class="bg-black h-full w-full py-2 bd-button">
								CLAIM
							</button>
						</drill-screwed-card>
					</div>
				</article>
			</section>
		</main>

		<footer class="px-8 py-4 flex justify-between bp-bg-metal mt-auto bg-black">
			<div class="flex gap-2 items-center">
				<img src="assets/images/logo.webp" class="w-10" />
				<p class="m-0 text-xs">
					<span>OSS project made by</span>

					<br />

					<span class="uppercase bp-color-primary font-bold">
						Heavy Duty Builders
					</span>

					<br />

					<a
						href="https://github.com/heavy-duty/platform"
						target="_blank"
						class="bp-color-primary underline"
						>Check the code for yourself.</a
					>
				</p>
			</div>

			<div>
				<p class="mb-2">Find us on:</p>

				<div class="flex gap-4">
					<figure>
						<a href="https://github.com/heavy-duty" target="_blank">
							<img
								src="assets/images/social/github.png"
								class="w-8 h-8"
								alt="Github button"
								width="32"
								height="32"
							/>
						</a>
					</figure>
					<figure>
						<a href="https://discord.gg/Ej47EUAj4u" target="_blank">
							<img
								src="assets/images/social/discord.png"
								class="w-8 h-8"
								alt="Discord button"
								width="32"
								height="32"
							/>
						</a>
					</figure>
					<figure>
						<a href="https://twitter.com/HeavyDutyBuild" target="_blank">
							<img
								src="assets/images/social/twitter.png"
								class="w-8 h-8"
								alt="Twitter button"
								width="32"
								height="32"
							/>
						</a>
					</figure>
				</div>
			</div>
		</footer>
	`,
	providers: [
		RepositoryStore,
		IssuesStore,
		BoardStore,
		BountiesStore,
		BoardPageStore,
	],
})
export class BoardPageComponent {
	@HostBinding('class') class = 'flex flex-col h-screen';
	readonly board$ = this._boardPageStore.board$;
	readonly bounties$ = this._boardPageStore.bounties$;

	constructor(private readonly _boardPageStore: BoardPageStore) {}

	trackBy(_: number, bounty: BountyViewModel): number {
		return bounty.id;
	}
}
