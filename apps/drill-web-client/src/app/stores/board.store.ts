import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Account, Mint } from '@solana/spl-token';
import { EMPTY, finalize, forkJoin, switchMap } from 'rxjs';
import { Board, DrillApiService } from '../services/drill-api.service';
import { Option } from '../types';

interface ViewModel {
	loading: boolean;
	boardId: Option<number>;
	board: Option<Board & { vault: Option<Account> }>;
	mint: Option<Mint>;
	error: unknown;
}

const initialState = {
	loading: false,
	boardId: null,
	board: null,
	boardVault: null,
	mint: null,
	error: null,
};

@Injectable()
export class BoardStore extends ComponentStore<ViewModel> {
	readonly boardId$ = this.select(({ boardId }) => boardId);
	readonly board$ = this.select(({ board }) => board);
	readonly mint$ = this.select(({ mint }) => mint);

	constructor(private readonly _drillApiService: DrillApiService) {
		super(initialState);

		this._loadBoard(this.boardId$);
		this._loadBoardMint(this.board$);
	}

	readonly setBoardId = this.updater<number>((state, boardId) => ({
		...state,
		boardId,
	}));

	private readonly _loadBoard = this.effect<Option<number>>(
		switchMap((boardId) => {
			if (boardId === null) {
				return EMPTY;
			}

			this.patchState({
				loading: true,
				board: null,
				error: null,
			});

			return forkJoin({
				board: this._drillApiService.getBoard(boardId),
				boardVault: this._drillApiService.getBoardVault(boardId),
			}).pipe(
				tapResponse(
					({ board, boardVault }) =>
						this.patchState({
							board: board && { ...board, vault: boardVault },
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

	private readonly _loadBoardMint = this.effect<Board | null>(
		switchMap((board) => {
			if (board === null) {
				return EMPTY;
			}

			return this._drillApiService.getMint(board.acceptedMint).pipe(
				tapResponse(
					(mint) => this.patchState({ mint }),
					(error) => this.patchState({ error })
				)
			);
		})
	);
}
