import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
	Document,
	InstructionAccountConstraint,
	InstructionAccountConstraintFilters,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { List, Map } from 'immutable';
import { EMPTY, switchMap } from 'rxjs';
import { InstructionAccountConstraintApiService } from './instruction-account-constraint-api.service';

interface ViewModel {
	loading: boolean;
	filters: InstructionAccountConstraintFilters | null;
	instructionAccountConstraintIds: List<string> | null;
	instructionAccountConstraintsMap: Map<
		string,
		Document<InstructionAccountConstraint>
	> | null;
}

const initialState: ViewModel = {
	loading: false,
	filters: null,
	instructionAccountConstraintIds: null,
	instructionAccountConstraintsMap: null,
};

@Injectable()
export class InstructionAccountConstraintsStore extends ComponentStore<ViewModel> {
	readonly loading$ = this.select(({ loading }) => loading);
	readonly filters$ = this.select(({ filters }) => filters);
	readonly instructionAccountConstraintIds$ = this.select(
		({ instructionAccountConstraintIds }) => instructionAccountConstraintIds
	);
	readonly instructionAccountConstraintsMap$ = this.select(
		({ instructionAccountConstraintsMap }) => instructionAccountConstraintsMap
	);
	readonly instructionAccountConstraints$ = this.select(
		this.instructionAccountConstraintsMap$,
		(instructionAccountConstraintsMap) =>
			instructionAccountConstraintsMap === null
				? null
				: instructionAccountConstraintsMap
						.toList()
						.sort((a, b) => (b.createdAt.lt(a.createdAt) ? 1 : -1))
	);

	constructor(
		private readonly _instructionAccountConstraintApiService: InstructionAccountConstraintApiService,
		private readonly _notificationStore: NotificationStore
	) {
		super(initialState);

		this._loadInstructionAccountConstraints(
			this.instructionAccountConstraintIds$
		);
		this._loadInstructionAccountConstraintIds(this.filters$);
	}

	readonly setFilters =
		this.updater<InstructionAccountConstraintFilters | null>(
			(state, filters) => ({
				...state,
				filters,
				instructionAccountConstraintIds: null,
				instructionAccountConstraintsMap: null,
			})
		);

	private readonly _loadInstructionAccountConstraintIds =
		this.effect<InstructionAccountConstraintFilters | null>(
			switchMap((filters) => {
				if (filters === null) {
					return EMPTY;
				}

				this.patchState({
					loading: true,
					instructionAccountConstraintsMap: null,
				});

				return this._instructionAccountConstraintApiService
					.findIds(filters)
					.pipe(
						tapResponse(
							(instructionAccountConstraintIds) => {
								this.patchState({
									instructionAccountConstraintIds: List(
										instructionAccountConstraintIds
									),
								});
							},
							(error) => {
								console.log('im erroring out');
								this._notificationStore.setError(error);
							}
						)
					);
			})
		);

	private readonly _loadInstructionAccountConstraints =
		this.effect<List<string> | null>(
			switchMap((instructionAccountConstraintIds) => {
				if (instructionAccountConstraintIds === null) {
					return EMPTY;
				}

				if (instructionAccountConstraintIds.size === 0) {
					this.patchState({
						loading: false,
						instructionAccountConstraintsMap: Map<
							string,
							Document<InstructionAccountConstraint>
						>(),
					});

					return EMPTY;
				}

				console.log(instructionAccountConstraintIds.toArray());

				return this._instructionAccountConstraintApiService
					.findByIds(instructionAccountConstraintIds.toArray())
					.pipe(
						tapResponse(
							(instructionAccountConstraints) => {
								this.patchState({
									loading: false,
									instructionAccountConstraintsMap:
										instructionAccountConstraints
											.filter(
												(
													instructionAccountConstraint
												): instructionAccountConstraint is Document<InstructionAccountConstraint> =>
													instructionAccountConstraint !== null
											)
											.reduce(
												(
													instructionAccountConstraintsMap,
													instructionAccountConstraint
												) =>
													instructionAccountConstraintsMap.set(
														instructionAccountConstraint.id,
														instructionAccountConstraint
													),
												Map<string, Document<InstructionAccountConstraint>>()
											),
								});
							},
							(error) => this._notificationStore.setError(error)
						)
					);
			})
		);
}
