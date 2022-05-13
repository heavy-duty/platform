import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Account } from '@solana/spl-token';
import { EMPTY, finalize, forkJoin, switchMap } from 'rxjs';
import { Bounty, DrillApiService } from '../services/drill-api.service';
import { NotificationService } from '../services/notification.service';
import { Option } from '../types';

interface ViewModel {
	loading: Option<boolean>;
	boardId: Option<number>;
	bountyIds: Option<number[]>;
	bounties: Option<Option<Bounty & { vault: Option<Account> }>[] | null>;
	error: unknown;
}

const initialState = {
	loading: null,
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
	readonly loading$ = this.select(({ loading }) => loading);

	constructor(
		private readonly _drillApiService: DrillApiService,
		private readonly _notificationService: NotificationService
	) {
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
					(error) => {
						this.patchState({ error });
						this._notificationService.notifyError(error);
					}
				),
				finalize(() => this.patchState({ loading: false }))
			);
		})
	);
}
