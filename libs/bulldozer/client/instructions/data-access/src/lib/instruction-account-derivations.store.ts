import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
	Document,
	InstructionAccountDerivation,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { List, Map } from 'immutable';
import { EMPTY, switchMap } from 'rxjs';
import { InstructionAccountDerivationApiService } from './instruction-account-derivation-api.service';

interface ViewModel {
	loading: boolean;
	instructionAccountDerivationIds: List<string> | null;
	instructionAccountDerivationsMap: Map<
		string,
		Document<InstructionAccountDerivation>
	> | null;
}

const initialState: ViewModel = {
	loading: false,
	instructionAccountDerivationIds: null,
	instructionAccountDerivationsMap: null,
};

@Injectable()
export class InstructionAccountDerivationsStore extends ComponentStore<ViewModel> {
	readonly loading$ = this.select(({ loading }) => loading);
	readonly instructionAccountDerivationIds$ = this.select(
		({ instructionAccountDerivationIds }) => instructionAccountDerivationIds
	);
	readonly instructionAccountDerivationsMap$ = this.select(
		({ instructionAccountDerivationsMap }) => instructionAccountDerivationsMap
	);
	readonly instructionAccountDerivations$ = this.select(
		this.instructionAccountDerivationsMap$,
		(instructionAccountDerivationsMap) =>
			instructionAccountDerivationsMap === null
				? null
				: instructionAccountDerivationsMap.toList()
	);

	constructor(
		private readonly _instructionAccountDerivationApiService: InstructionAccountDerivationApiService,
		private readonly _notificationStore: NotificationStore
	) {
		super(initialState);

		this._loadInstructionAccountDerivations(
			this.instructionAccountDerivationIds$
		);
	}

	readonly setInstructionAccountDerivationIds =
		this.updater<List<string> | null>(
			(state, instructionAccountDerivationIds) => ({
				...state,
				instructionAccountDerivationIds,
			})
		);

	private readonly _loadInstructionAccountDerivations =
		this.effect<List<string> | null>(
			switchMap((instructionAccountDerivationIds) => {
				if (instructionAccountDerivationIds === null) {
					return EMPTY;
				}

				return this._instructionAccountDerivationApiService
					.findByIds(instructionAccountDerivationIds.toArray())
					.pipe(
						tapResponse(
							(instructionAccountDerivations) => {
								this.patchState({
									loading: false,
									instructionAccountDerivationsMap:
										instructionAccountDerivations
											.filter(
												(
													instructionAccountDerivation
												): instructionAccountDerivation is Document<InstructionAccountDerivation> =>
													instructionAccountDerivation !== null
											)
											.reduce(
												(
													instructionAccountDerivationsMap,
													instructionAccountDerivation
												) =>
													instructionAccountDerivationsMap.set(
														instructionAccountDerivation.id,
														instructionAccountDerivation
													),
												Map<string, Document<InstructionAccountDerivation>>()
											),
								});
							},
							(error) => this._notificationStore.setError({ error })
						)
					);
			})
		);
}
