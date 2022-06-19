import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';

interface ViewModel {
	collectionId: string | null;
	code: string | null;
	error: unknown;
	loading: boolean | null;
}

const initialState: ViewModel = {
	collectionId: null,
	code: null,
	error: null,
	loading: null,
};

@Injectable()
export class ViewCollectionCodeStore extends ComponentStore<ViewModel> {
	readonly code$ = this.select(({ code }) => code);
	readonly collectionId$ = this.select(({ collectionId }) => collectionId);

	constructor(private readonly _httpClient: HttpClient) {
		super(initialState);

		this._loadCode(this.collectionId$);
	}

	readonly setCollectionId = this.updater<string | null>(
		(state, collectionId) => ({
			...state,
			collectionId,
		})
	);

	readonly _loadCode = this.effect<string | null>(
		switchMap((collectionId) => {
			if (collectionId === null) {
				return EMPTY;
			}

			this.patchState({ loading: true });

			return this._httpClient
				.get<{ result: string }>(
					`http://localhost:3334/api/get-collection-code/${collectionId}`
				)
				.pipe(
					tapResponse(
						(data) => this.patchState({ code: data.result, loading: false }),
						(error) => this.patchState({ error, loading: false })
					)
				);
		})
	);
}
