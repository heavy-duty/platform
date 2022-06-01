import { Injectable } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { concatMap, of, tap, withLatestFrom } from 'rxjs';
import { StateFrom } from 'xstate';
import { signTransactionServiceFactory } from '../machines';
import { Option, tapEffect } from '../utils';

type ServiceType = ReturnType<typeof signTransactionServiceFactory>;
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
export class SignTransactionSectionStore extends ComponentStore<ViewModel> {
	readonly service$ = this.select(({ service }) => service);
	readonly serviceState$ = this.select(({ serviceState }) => serviceState);
	readonly transaction$ = this.select(
		this.serviceState$,
		(serviceState) => serviceState?.context.transaction ?? null
	);
	readonly signatures$ = this.select(
		this.serviceState$,
		(serviceState) => serviceState?.context.signatures ?? null
	);
	readonly disabled$ = this.select(
		this.serviceState$,
		this._walletStore.publicKey$,
		(serviceState, signer) =>
			serviceState === null ||
			signer === null ||
			!serviceState.can({
				type: 'signTransactionWithWallet',
				value: { publicKey: signer, signature: Buffer.alloc(0) },
			})
	);

	constructor(private readonly _walletStore: WalletStore) {
		super(initialState);

		this.start(
			signTransactionServiceFactory({
				fireAndForget: false,
			})
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

	readonly startSigning = this.effect<Option<Transaction>>(
		concatMap((transaction) =>
			of(transaction).pipe(
				withLatestFrom(this.service$),
				tap(([transaction, service]) => {
					if (service === null || transaction === null) {
						return;
					}

					service.send({
						type: 'startSigning',
						value: transaction,
					});
				})
			)
		)
	);

	readonly signTransactionWithWallet = this.effect<{
		publicKey: Option<PublicKey>;
		signature: Option<Buffer>;
	}>(
		concatMap(({ publicKey, signature }) =>
			of({ publicKey, signature }).pipe(
				withLatestFrom(this.service$),
				tap(([{ publicKey, signature }, service]) => {
					if (service === null || publicKey === null || signature === null) {
						return;
					}

					service.send({
						type: 'signTransactionWithWallet',
						value: {
							publicKey,
							signature,
						},
					});
				})
			)
		)
	);

	readonly signTransactionWithKeypair = this.effect<Keypair>(
		concatMap((keypair) =>
			of(keypair).pipe(
				withLatestFrom(this.service$),
				tap(([keypair, service]) => {
					if (service === null) {
						return;
					}

					service.send({
						type: 'signTransactionWithKeypair',
						value: keypair,
					});
				})
			)
		)
	);

	readonly restart = this.effect<void>(
		concatMap(() =>
			of(null).pipe(
				withLatestFrom(this.service$),
				tap(([, service]) => {
					if (service === null) {
						return;
					}

					service.send('restart');
				})
			)
		)
	);
}
