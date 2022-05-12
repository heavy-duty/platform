import { Injectable } from '@angular/core';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { Account } from '@solana/spl-token';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Bounty } from '../services/drill-api.service';
import { BoardMintStore } from '../stores/board-mint.store';
import { BoardStore } from '../stores/board.store';
import { BountiesStore } from '../stores/bounties.store';
import { IssuesStore } from '../stores/issues.store';
import { RepositoryStore } from '../stores/repository.store';
import { Option } from '../types';

export interface UserViewModel {
	login: string;
	avatarUrl: string;
	htmlUrl: string;
}

export interface BountyViewModel {
	id: number;
	title: string;
	htmlUrl: string;
	body: Option<string>;
	creator: UserViewModel;
	hunter: Option<UserViewModel>;
	bounty: Option<
		Bounty & { vault: Option<Account> } & { uiAmount: Option<number> }
	>;
}

@Injectable()
export class BoardPageStore extends ComponentStore<object> {
	readonly githubRepository = environment.githubRepository;
	readonly bounties$: Observable<Option<BountyViewModel[]>> = this.select(
		this._boardStore.board$,
		this._boardMintStore.boardMint$,
		this._issuesStore.issues$,
		this._bountiesStore.bounties$,
		(board, boardMint, issues, bounties) =>
			issues &&
			issues.map((issue) => {
				const bounty =
					bounties?.find(
						(bounty) =>
							bounty &&
							bounty.id === issue.number &&
							bounty.boardId === board?.id
					) ?? null;

				return {
					id: issue.id,
					title: issue.title,
					htmlUrl: issue.html_url,
					body: issue.body,
					state: issue.state,
					creator: {
						login: issue.user.login,
						avatarUrl: issue.user.avatar_url,
						htmlUrl: issue.user.html_url,
					},
					hunter:
						issue.assignee !== null
							? {
									login: issue.assignee.login,
									avatarUrl: issue.assignee.avatar_url,
									htmlUrl: issue.assignee.html_url,
							  }
							: null,
					boardMint,
					bounty:
						bounty !== null
							? {
									...bounty,
									uiAmount:
										bounty.vault !== null && boardMint !== null
											? Number(bounty.vault.amount) /
											  Math.pow(10, boardMint.decimals)
											: null,
							  }
							: null,
				};
			})
	);

	constructor(
		private readonly _repositoryStore: RepositoryStore,
		private readonly _issuesStore: IssuesStore,
		private readonly _boardStore: BoardStore,
		private readonly _boardMintStore: BoardMintStore,
		private readonly _bountiesStore: BountiesStore
	) {
		super();

		this._repositoryStore.setGithubRepository(environment.githubRepository);
		this._issuesStore.setGithubRepository(environment.githubRepository);
		this._boardStore.setBoardId(
			this._repositoryStore.repository$.pipe(
				isNotNullOrUndefined,
				map((repository) => repository.id)
			)
		);
		this._boardMintStore.setMintId(
			this._boardStore.board$.pipe(
				isNotNullOrUndefined,
				map((board) => board.acceptedMint)
			)
		);
		this._bountiesStore.setBoardId(
			this._repositoryStore.repository$.pipe(
				isNotNullOrUndefined,
				map((repository) => repository.id)
			)
		);
		this._bountiesStore.setBountyIds(
			this._issuesStore.issues$.pipe(
				isNotNullOrUndefined,
				map((issues) => issues.map((issue) => issue.number))
			)
		);
	}
}
