import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Bounty } from '../services/drill-api.service';
import { BoardMintStore } from '../stores/board-mint.store';
import { BoardStore } from '../stores/board.store';
import { BountyStore } from '../stores/bounty.store';
import { IssueStore } from '../stores/issue.store';
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
	bounty: Option<Bounty>;
}

@Injectable()
export class BountyPageStore extends ComponentStore<object> {
	readonly githubRepository = environment.githubRepository;
	readonly bountyId$ = this._activatedRoute.paramMap.pipe(
		map((paramMap) => {
			const bountyId = paramMap.get('bountyId');

			return bountyId !== null ? parseInt(bountyId) : null;
		})
	);
	readonly bountyTotal$ = this.select(
		this._bountyStore.bountyVault$,
		this._boardMintStore.boardMint$,
		(bountyVault, boardMint) => {
			if (bountyVault === null || boardMint === null) {
				return null;
			}

			return Number(bountyVault.amount) / Math.pow(10, boardMint.decimals);
		}
	);
	readonly loadingTotal$ = this.select(
		this._boardMintStore.loading$,
		this._bountyStore.loading$,
		(boardMintLoading, bountyLoading) =>
			boardMintLoading === null ||
			bountyLoading === null ||
			boardMintLoading ||
			bountyLoading
	);

	constructor(
		private readonly _repositoryStore: RepositoryStore,
		private readonly _issueStore: IssueStore,
		private readonly _boardStore: BoardStore,
		private readonly _boardMintStore: BoardMintStore,
		private readonly _bountyStore: BountyStore,
		private readonly _activatedRoute: ActivatedRoute
	) {
		super({});

		this._repositoryStore.setGithubRepository(environment.githubRepository);
		this._issueStore.setGithubRepository(environment.githubRepository);
		this._issueStore.setIssueNumber(this.bountyId$.pipe(isNotNullOrUndefined));
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
		this._bountyStore.setBoardId(
			this._repositoryStore.repository$.pipe(
				isNotNullOrUndefined,
				map((repository) => repository.id)
			)
		);
		this._bountyStore.setBountyId(this.bountyId$.pipe(isNotNullOrUndefined));
	}
}
