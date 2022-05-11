import { Component } from '@angular/core';
import { AppStore } from './app.store';
import { BoardStore } from './board.store';
import { BountiesStore } from './bounties.store';
import { IssuesStore } from './issues.store';
import { RepositoryStore } from './repository.store';

@Component({
	selector: 'drill-root',
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
				<article *ngFor="let bounty of bounties">
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
	styles: [],
	providers: [
		RepositoryStore,
		IssuesStore,
		BoardStore,
		BountiesStore,
		AppStore,
	],
})
export class AppComponent {
	readonly board$ = this._appStore.board$;
	readonly bounties$ = this._appStore.bounties$;

	constructor(private readonly _appStore: AppStore) {}
}
