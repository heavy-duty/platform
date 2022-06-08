import { Injectable } from '@angular/core';
import { ConnectionStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { concatMap, of, tap, withLatestFrom } from 'rxjs';
import { StateFrom } from 'xstate';
import { blockhashStatusServiceFactory } from '../../machines';
import { isNotNull, Option, tapEffect } from '../../utils';

type ServiceType = ReturnType<typeof blockhashStatusServiceFactory>;
type StateType = StateFrom<ServiceType['machine']>;

interface ViewModel {
	service: Option<ServiceType>;
	serviceState: Option<StateType>;
}

const initialState: ViewModel = {
	service: null,
	serviceState: null,
};

@Injectable()
export class BlockhashStatusSectionStore extends ComponentStore<ViewModel> {
	readonly service$ = this.select(({ service }) => service);
	readonly serviceState$ = this.select(({ serviceState }) => serviceState);
	readonly percentage$ = this.select(
		this.serviceState$,
		(serviceState) => serviceState?.context.percentage ?? null
	);
	readonly isValid$ = this.select(
		this.serviceState$,
		(serviceState) => serviceState?.context.isValid ?? null
	);
	readonly blockhash$ = this.select(
		this.serviceState$,
		(serviceState) => serviceState?.context.blockhash ?? null
	);
	readonly lastValidBlockHeight$ = this.select(
		this.serviceState$,
		(serviceState) => serviceState?.context.lastValidBlockHeight ?? null
	);
	readonly latestBlockhash$ = this.select(
		this.blockhash$,
		this.lastValidBlockHeight$,
		(blockhash, lastValidBlockHeight) => ({ blockhash, lastValidBlockHeight })
	);

	constructor(private readonly _connectionStore: ConnectionStore) {
		super(initialState);

		this.start(
			this.select(
				this._connectionStore.connection$.pipe(isNotNull),
				(connection) =>
					blockhashStatusServiceFactory(connection, {
						fireAndForget: false,
					})
			)
		);
	}

	readonly start = this.effect<ServiceType>(
		tapEffect((service) => {
			service.start();

			this.patchState({ service });
			service.onTransition((state) => this.patchState({ serviceState: state }));

			return () => {
				service.stop();
			};
		})
	);

	readonly getBlockHeight = this.effect<void>(
		concatMap(() =>
			of(null).pipe(
				withLatestFrom(this.service$),
				tap(([, service]) => {
					if (service === null) {
						return;
					}

					service.send('getBlockHeight');
				})
			)
		)
	);
}
