import { Injectable } from '@angular/core';
import { ConnectionStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { Transaction } from '@solana/web3.js';
import { concatMap, of, tap, withLatestFrom } from 'rxjs';
import { StateFrom } from 'xstate';
import { sendTransactionServiceFactory } from '../../machines';
import { isNotNull, tapEffect } from '../../utils';

type ServiceType = ReturnType<typeof sendTransactionServiceFactory>;
type StateType = StateFrom<ServiceType['machine']>;
type Option<T> = T | null;

interface ViewModel {
	service: Option<ServiceType>;
	serviceState: Option<StateType>;
	transaction: Option<Transaction>;
}

const initialState: ViewModel = {
	service: null,
	serviceState: null,
	transaction: null,
};

@Injectable()
export class SendTransactionButtonStore extends ComponentStore<ViewModel> {
	readonly service$ = this.select(({ service }) => service);
	readonly serviceState$ = this.select(({ serviceState }) => serviceState);
	readonly transaction$ = this.select(
		this.serviceState$,
		(serviceState) => serviceState?.context.transaction ?? null
	);
	readonly disabled$ = this.select(
		this.serviceState$,
		(serviceState) =>
			serviceState === null || !serviceState.can('sendTransaction')
	);

	constructor(private readonly _connectionStore: ConnectionStore) {
		super(initialState);

		this.start(
			this.select(
				this._connectionStore.connection$.pipe(isNotNull),
				(connection) =>
					sendTransactionServiceFactory(connection, {
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

	readonly startSending = this.effect<Option<Transaction>>(
		concatMap((transaction) =>
			of(transaction).pipe(
				withLatestFrom(this.service$),
				tap(([transaction, service]) => {
					if (service === null || transaction === null) {
						return;
					}

					service.send({
						type: 'startSending',
						value: transaction,
					});
				})
			)
		)
	);

	readonly sendTransaction = this.effect<void>(
		concatMap(() =>
			of(null).pipe(
				withLatestFrom(this.service$),
				tap(([, service]) => {
					if (service === null) {
						return;
					}

					service.send('sendTransaction');
				})
			)
		)
	);
}
