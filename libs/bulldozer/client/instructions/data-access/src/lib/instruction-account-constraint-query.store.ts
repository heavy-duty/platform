import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionAccountConstraintFilters } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { InstructionAccountConstraintApiService } from './instruction-account-constraint-api.service';

interface ViewModel {
	loading: boolean;
	instructionAccountConstraintIds: string[] | null;
	filters: InstructionAccountConstraintFilters | null;
}

const initialState: ViewModel = {
	loading: false,
	filters: null,
	instructionAccountConstraintIds: null,
};

@Injectable()
export class InstructionAccountConstraintQueryStore extends ComponentStore<ViewModel> {
	readonly loading$ = this.select(({ loading }) => loading);
	readonly filters$ = this.select(({ filters }) => filters);
	readonly instructionAccountConstraintIds$ = this.select(
		({ instructionAccountConstraintIds }) => instructionAccountConstraintIds
	);

	constructor(
		private readonly _instructionAccountConstraintApiService: InstructionAccountConstraintApiService,
		private readonly _notificationStore: NotificationStore
	) {
		super(initialState);

		this._loadInstructionAccountConstraintIds(this.filters$);
	}

	private readonly _loadInstructionAccountConstraintIds =
		this.effect<InstructionAccountConstraintFilters | null>(
			switchMap((filters) => {
				if (filters === null) {
					return EMPTY;
				}

				this.patchState({ loading: true });

				return this._instructionAccountConstraintApiService
					.findIds(filters)
					.pipe(
						tapResponse(
							(instructionAccountConstraintIds) => {
								this.patchState({
									instructionAccountConstraintIds,
									loading: false,
								});
							},
							(error) => this._notificationStore.setError(error)
						)
					);
			})
		);

	readonly setFilters =
		this.updater<InstructionAccountConstraintFilters | null>(
			(state, filters) => ({
				...state,
				filters,
			})
		);
}
