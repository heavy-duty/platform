import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, combineLatest, EMPTY, map, switchMap } from 'rxjs';
import { InstructionApiService } from './instruction-api.service';

interface ViewModel {
	loading: boolean;
	instructionId: string | null;
	instruction: Document<Instruction> | null;
}

const initialState: ViewModel = {
	loading: false,
	instructionId: null,
	instruction: null,
};

@Injectable()
export class InstructionStore extends ComponentStore<ViewModel> {
	private readonly _reload = new BehaviorSubject(null);
	readonly loading$ = this.select(({ loading }) => loading);
	readonly instructionId$ = this.select(({ instructionId }) => instructionId);
	readonly instruction$ = this.select(({ instruction }) => instruction);

	constructor(
		private readonly _instructionApiService: InstructionApiService,
		private readonly _notificationStore: NotificationStore
	) {
		super(initialState);

		this._loadInstruction(
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

	private readonly _loadInstruction = this.effect<string | null>(
		switchMap((instructionId) => {
			if (instructionId === null) {
				return EMPTY;
			}

			this.patchState({ loading: true, instruction: null });

			return this._instructionApiService.findById(instructionId).pipe(
				tapResponse(
					(instruction) => {
						this.patchState({
							loading: false,
							instruction,
						});
					},
					(error) => this._notificationStore.setError({ error })
				)
			);
		})
	);

	reload() {
		this._reload.next(null);
	}
}
