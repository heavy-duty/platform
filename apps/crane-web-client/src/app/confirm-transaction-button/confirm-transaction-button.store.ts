import { Injectable } from '@angular/core';
import { ConnectionStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { TransactionSignature } from '@solana/web3.js';
import { concatMap, of, tap, withLatestFrom } from 'rxjs';
import { StateFrom } from 'xstate';
import { confirmTransactionServiceFactory } from '../machines';
import { isNotNull, Option, tapEffect } from '../utils';

type ServiceType = ReturnType<typeof confirmTransactionServiceFactory>;
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
export class ConfirmTransactionButtonStore extends ComponentStore<ViewModel> {
	readonly service$ = this.select(({ service }) => service);
	readonly serviceState$ = this.select(({ serviceState }) => serviceState);
	readonly disabled$ = this.select(
		this.serviceState$,
		(serviceState) =>
			serviceState === null ||
			!serviceState.can({
				type: 'confirmTransaction',
			})
	);

	constructor(private readonly _connectionStore: ConnectionStore) {
		super(initialState);

		this.start(
			this.select(
				this._connectionStore.connection$.pipe(isNotNull),
				(connection) =>
					confirmTransactionServiceFactory(connection, {
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

	readonly startConfirming = this.effect<Option<TransactionSignature>>(
		concatMap((signature) =>
			of(signature).pipe(
				withLatestFrom(this.service$),
				tap(([signature, service]) => {
					if (service === null || signature === null) {
						return;
					}

					service.send({
						type: 'startConfirming',
						value: signature,
					});
				})
			)
		)
	);

	readonly confirmTransaction = this.effect<void>(
		concatMap(() =>
			of(null).pipe(
				withLatestFrom(this.service$),
				tap(([, service]) => {
					if (service === null) {
						return;
					}

					service.send('confirmTransaction');
				})
			)
		)
	);
}
