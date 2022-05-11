import { Component } from '@angular/core';
import { BoardPageStore, BountyViewModel } from './board-page.store';
import { BoardStore } from './board.store';
import { BountiesStore } from './bounties.store';
import { IssuesStore } from './issues.store';
import { RepositoryStore } from './repository.store';

@Component({
	selector: 'drill-board-page',
	template: `
		<header>
			<h1>
				Bounty Board for<br />

				<a
					*ngIf="board$ | async as board"
					[href]="board.htmlUrl"
					target="_blank"
				>
					@{{ board.fullName }}
				</a>
			</h1>
			<p>
				Do you have what it takes? Pick a bounty and make a name for yourself.
			</p>
		</header>

		<main>
			<section *ngIf="bounties$ | async as bounties">
				<article *ngFor="let bounty of bounties; trackBy: trackBy">
					<h2>{{ bounty.title }}</h2>
					<p>{{ bounty.body }}</p>
					<a [href]="bounty.htmlUrl">View details in GitHub</a>

					<div>
						<figure>
							<img [src]="bounty.creator.avatarUrl" />
						</figure>

						<div>
							<span>@{{ bounty.creator.login }}</span>
							<span>Creator</span>
						</div>
					</div>
					<div>
						<figure>
							<img [src]="bounty.creator.avatarUrl" />
						</figure>

						<div>
							<span>@{{ bounty.creator.login }}</span>
							<span>Bounty Hunter</span>
						</div>
					</div>

					<p>
						{{ bounty.bounty?.vault?.amount }}
					</p>

					<button>CLAIM</button>
				</article>
			</section>
		</main>

		<footer>Made by Heavy Duty Builders.</footer>
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
	readonly board$ = this._boardPageStore.board$;
	readonly bounties$ = this._boardPageStore.bounties$;

	constructor(private readonly _boardPageStore: BoardPageStore) {}

	trackBy(_: number, bounty: BountyViewModel): number {
		return bounty.id;
	}
}
