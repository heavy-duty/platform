import { Injectable } from '@angular/core';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { map } from 'rxjs';
import { environment } from '../environments/environment';
import { BoardStore } from './board.store';
import { BountiesStore } from './bounties.store';
import { IssuesStore } from './issues.store';
import { RepositoryStore } from './repository.store';

@Injectable()
export class AppStore extends ComponentStore<object> {
	readonly githubRepository = environment.githubRepository;
	readonly board$ = this.select(
		this._boardStore.board$,
		this._repositoryStore.repository$,
		(board, repository) =>
			repository && {
				fullName: repository.full_name,
				owner: {
					login: repository.owner.login,
					avatarUrl: repository.owner.avatar_url,
				},
				htmlUrl: repository.html_url,
				board,
			}
	);
	readonly bounties$ = this.select(
		this._boardStore.board$,
		this._issuesStore.issues$,
		this._bountiesStore.bounties$,
		(board, issues, bounties) =>
			issues &&
			issues.map((issue) => ({
				title: issue.title,
				htmlUrl: issue.html_url,
				body: issue.body ?? '',
				state: issue.state,
				creator: {
					login: issue.user.login,
					avatarUrl: issue.user.avatar_url,
				},
				hunter:
					issue.assignee !== null
						? {
								login: issue.assignee.login,
								avatarUrl: issue.assignee.avatar_url,
						  }
						: null,
				bounty:
					bounties?.find(
						(bounty) =>
							bounty &&
							bounty.id === issue.number &&
							bounty.boardId === board?.id
					) ?? null,
			}))
	);

	constructor(
		private readonly _repositoryStore: RepositoryStore,
		private readonly _issuesStore: IssuesStore,
		private readonly _boardStore: BoardStore,
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
