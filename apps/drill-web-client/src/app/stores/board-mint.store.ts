import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Mint } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { EMPTY, finalize, switchMap } from 'rxjs';
import { DrillApiService } from '../services/drill-api.service';
import { Option } from '../types';

interface ViewModel {
	loading: boolean;
	mintId: Option<PublicKey>;
	boardMint: Option<Mint>;
	error: unknown;
}

const initialState = {
	loading: false,
	mintId: null,
	boardMint: null,
	error: null,
};

@Injectable()
export class BoardMintStore extends ComponentStore<ViewModel> {
	readonly mintId$ = this.select(({ mintId }) => mintId);
	readonly boardMint$ = this.select(({ boardMint }) => boardMint);

	constructor(private readonly _drillApiService: DrillApiService) {
		super(initialState);

		this._loadBoardMint(this.mintId$);
	}

	readonly setMintId = this.updater<PublicKey>((state, mintId) => ({
		...state,
		mintId,
	}));

	private readonly _loadBoardMint = this.effect<PublicKey | null>(
		switchMap((mintId) => {
			if (mintId === null) {
				return EMPTY;
			}

			this.patchState({
				loading: true,
				boardMint: null,
				error: null,
			});

			return this._drillApiService.getMint(mintId).pipe(
				tapResponse(
					(boardMint) => this.patchState({ boardMint }),
					(error) => this.patchState({ error })
				),
				finalize(() => this.patchState({ loading: false }))
			);
		})
	);
}
