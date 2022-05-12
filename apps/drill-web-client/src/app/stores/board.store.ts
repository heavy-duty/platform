import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Account } from '@solana/spl-token';
import { EMPTY, finalize, forkJoin, switchMap } from 'rxjs';
import { Board, DrillApiService } from '../services/drill-api.service';
import { NotificationService } from '../services/notification.service';
import { Option } from '../types';

interface ViewModel {
	loading: Option<boolean>;
	boardId: Option<number>;
	board: Option<Board & { vault: Option<Account> }>;
	error: unknown;
}

const initialState = {
	loading: false,
	boardId: null,
	board: null,
	boardVault: null,
	error: null,
};

@Injectable()
export class BoardStore extends ComponentStore<ViewModel> {
	readonly boardId$ = this.select(({ boardId }) => boardId);
	readonly board$ = this.select(({ board }) => board);
	readonly loading$ = this.select(({ loading }) => loading);

	constructor(
		private readonly _drillApiService: DrillApiService,
		private readonly _notificationService: NotificationService
	) {
		super(initialState);

		this._loadBoard(this.boardId$);
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
