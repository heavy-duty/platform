import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Account } from '@solana/spl-token';
import { EMPTY, finalize, forkJoin, switchMap } from 'rxjs';
import { Bounty, DrillApiService } from './drill-api.service';
import { Some } from './types';

interface ViewModel {
	loading: boolean;
	boardId: Some<number>;
	bountyIds: Some<number[]>;
	bounties: Some<Some<Bounty & { vault: Some<Account> }>[] | null>;
	error: unknown;
}

const initialState = {
	loading: false,
	boardId: null,
	bountyIds: null,
	bounties: null,
	error: null,
};

@Injectable()
export class BountiesStore extends ComponentStore<ViewModel> {
	readonly boardId$ = this.select(({ boardId }) => boardId);
	readonly bountyIds$ = this.select(({ bountyIds }) => bountyIds);
	readonly bounties$ = this.select(({ bounties }) => bounties);

	constructor(private readonly _drillApiService: DrillApiService) {
		super(initialState);

		this._loadBounties(
			this.select(this.boardId$, this.bountyIds$, (boardId, bountyIds) => ({
				boardId,
				bountyIds,
			}))
		);
	}

	readonly setBoardId = this.updater<number>((state, boardId) => ({
		...state,
		boardId,
	}));

	readonly setBountyIds = this.updater<number[]>((state, bountyIds) => ({
		...state,
		bountyIds,
	}));

	private readonly _loadBounties = this.effect<{
		boardId: number | null;
		bountyIds: number[] | null;
	}>(
		switchMap(({ boardId, bountyIds }) => {
			if (boardId === null || bountyIds === null) {
				return EMPTY;
			}

			this.patchState({
				loading: true,
				bounties: null,
				error: null,
			});

			return forkJoin({
				bounties: forkJoin(
					bountyIds.map((bountyId) =>
						this._drillApiService.getBounty(boardId, bountyId)
					)
				),
				bountyVaults: forkJoin(
					bountyIds.map((bountyId) =>
						this._drillApiService.getBountyVault(boardId, bountyId)
					)
				),
			}).pipe(
				tapResponse(
					({ bounties, bountyVaults }) =>
						this.patchState({
							bounties: bounties.map(
								(bounty, index) =>
									bounty && { ...bounty, vault: bountyVaults[index] }
							),
						}),
					(error) =>
						this.patchState({
							error,
						})
				),
				finalize(() => this.patchState({ loading: false }))
			);
		})
	);
}
