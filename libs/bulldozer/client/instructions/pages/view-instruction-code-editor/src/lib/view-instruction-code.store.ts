import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, combineLatest, EMPTY, map, switchMap } from 'rxjs';
import { ViewInstructionCodeEditorInstructionStore } from './view-instruction-code-editor-instruction.store';

interface ViewModel {
	instructionId: string | null;
	code: string | null;
	error: unknown;
	loading: boolean | null;
}

const initialState: ViewModel = {
	instructionId: null,
	code: null,
	error: null,
	loading: null,
};

@Injectable()
export class ViewInstructionCodeStore extends ComponentStore<ViewModel> {
	private readonly _reload = new BehaviorSubject(null);
	readonly code$ = this.select(({ code }) => code);
	readonly instructionId$ = this.select(({ instructionId }) => instructionId);
	readonly handleCode$ = this.select(
		this._viewInstructionCodeEditorInstructionStore.instruction$,
		(instruction) => instruction?.body ?? null
	);

	constructor(
		private readonly _httpClient: HttpClient,
		private readonly _viewInstructionCodeEditorInstructionStore: ViewInstructionCodeEditorInstructionStore
	) {
		super(initialState);

		this._loadCode(
			combineLatest([this.instructionId$, this._reload.asObservable()]).pipe(
				map(([instructionId]) => instructionId)
			)
		);
	}

	readonly setInstructionId = this.updater<string | null>(
		(state, instructionId) => ({
			...state,
			instructionId,
		})
	);

	readonly _loadCode = this.effect<string | null>(
		switchMap((instructionId) => {
			if (instructionId === null) {
				return EMPTY;
			}

			this.patchState({ loading: true });

			return this._httpClient
				.get<{ result: string }>(
					`http://localhost:3334/api/get-instruction-code/${instructionId}`
				)
				.pipe(
					tapResponse(
						(data) => this.patchState({ code: data.result, loading: false }),
						(error) => this.patchState({ error, loading: false })
					)
				);
		})
	);

	reload() {
		this._reload.next(null);
	}
}
