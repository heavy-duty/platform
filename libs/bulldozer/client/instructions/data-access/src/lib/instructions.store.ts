import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
	Document,
	Instruction,
	InstructionFilters,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { List, Map } from 'immutable';
import { EMPTY, switchMap } from 'rxjs';
import { InstructionApiService } from './instruction-api.service';

interface ViewModel {
	loading: boolean;
	filters: InstructionFilters | null;
	instructionIds: List<string> | null;
	instructionsMap: Map<string, Document<Instruction>> | null;
}

const initialState: ViewModel = {
	loading: false,
	filters: null,
	instructionIds: null,
	instructionsMap: null,
};

@Injectable()
export class InstructionsStore extends ComponentStore<ViewModel> {
	readonly loading$ = this.select(({ loading }) => loading);
	readonly filters$ = this.select(({ filters }) => filters);
	readonly instructionIds$ = this.select(
		({ instructionIds }) => instructionIds
	);
	readonly instructionsMap$ = this.select(
		({ instructionsMap }) => instructionsMap
	);
	readonly instructions$ = this.select(
		this.instructionsMap$,
		(instructionsMap) =>
			instructionsMap === null
				? null
				: instructionsMap
						.toList()
						.sort((a, b) => (b.createdAt.lt(a.createdAt) ? 1 : -1))
	);

	constructor(
		private readonly _instructionApiService: InstructionApiService,
		private readonly _notificationStore: NotificationStore
	) {
		super(initialState);

		this._loadInstructions(this.instructionIds$);
		this._loadInstructionIds(this.filters$);
	}

	readonly setFilters = this.updater<InstructionFilters | null>(
		(state, filters) => ({
			...state,
			filters,
			instructionIds: null,
			instructionsMap: null,
		})
	);

	private readonly _loadInstructionIds = this.effect<InstructionFilters | null>(
		switchMap((filters) => {
			if (filters === null) {
				return EMPTY;
			}

			this.patchState({
				loading: true,
				instructionIds: List(),
				instructionsMap: null,
			});

			return this._instructionApiService.findIds(filters).pipe(
				tapResponse(
					(instructionIds) => {
						this.patchState({
							instructionIds: List(instructionIds),
						});
					},
					(error) => this._notificationStore.setError(error)
				)
			);
		})
	);

	private readonly _loadInstructions = this.effect<List<string> | null>(
		switchMap((instructionIds) => {
			if (instructionIds === null) {
				return EMPTY;
			}

			return this._instructionApiService
				.findByIds(instructionIds.toArray())
				.pipe(
					tapResponse(
						(instructions) => {
							this.patchState({
								loading: false,
								instructionsMap: instructions
									.filter(
										(instruction): instruction is Document<Instruction> =>
											instruction !== null
									)
									.reduce(
										(instructionsMap, instruction) =>
											instructionsMap.set(instruction.id, instruction),
										Map<string, Document<Instruction>>()
									),
							});
						},
						(error) => {
							console.log('the error is here?=');
							this._notificationStore.setError({ error });
						}
					)
				);
		})
	);
}
