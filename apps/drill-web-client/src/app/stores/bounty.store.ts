import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Account } from '@solana/spl-token';
import { EMPTY, finalize, forkJoin, switchMap } from 'rxjs';
import { Bounty, DrillApiService } from '../services/drill-api.service';
import { Option } from '../types';

interface ViewModel {
	loading: Option<boolean>;
	boardId: Option<number>;
	bountyId: Option<number>;
	bounty: Option<Bounty>;
	bountyVault: Option<Account>;
	error: unknown;
}

const initialState = {
	loading: null,
	boardId: null,
	bountyId: null,
	bounty: null,
	bountyVault: null,
	error: null,
};

@Injectable()
export class BountyStore extends ComponentStore<ViewModel> {
	readonly loading$ = this.select(({ loading }) => loading);
	readonly boardId$ = this.select(({ boardId }) => boardId);
	readonly bountyId$ = this.select(({ bountyId }) => bountyId);
	readonly bounty$ = this.select(({ bounty }) => bounty);
	readonly bountyVault$ = this.select(({ bountyVault }) => bountyVault);

	constructor(private readonly _drillApiService: DrillApiService) {
		super(initialState);

		this._loadBounty(
			this.select(this.boardId$, this.bountyId$, (boardId, bountyId) => ({
				boardId,
				bountyId,
			}))
		);
	}

	readonly setBoardId = this.updater<number>((state, boardId) => ({
		...state,
		boardId,
	}));

	readonly setBountyId = this.updater<number>((state, bountyId) => ({
		...state,
		bountyId,
	}));

	private readonly _loadBounty = this.effect<{
		boardId: Option<number>;
		bountyId: Option<number>;
	}>(
		switchMap(({ boardId, bountyId }) => {
			if (boardId === null || bountyId === null) {
				return EMPTY;
			}

			this.patchState({
				loading: true,
				bounty: null,
				error: null,
			});

			return forkJoin({
				bounty: this._drillApiService.getBounty(boardId, bountyId),
				bountyVault: this._drillApiService.getBountyVault(boardId, bountyId),
			}).pipe(
				tapResponse(
					({ bounty, bountyVault }) => this.patchState({ bounty, bountyVault }),
					(error) => this.patchState({ error })
				),
				finalize(() => this.patchState({ loading: false }))
			);
		})
	);
}
