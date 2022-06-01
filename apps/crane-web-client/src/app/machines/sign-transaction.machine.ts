import {
	Keypair,
	PublicKey,
	SignaturePubkeyPair,
	Transaction,
} from '@solana/web3.js';
import { sign } from 'tweetnacl';
import { assign, createMachine, interpret } from 'xstate';
import { EventType, EventValue } from './types';

export type StartSigningEvent = EventType<'startSigning'> &
	EventValue<Transaction>;

export type RestartEvent = EventType<'restart'>;

export type SignTransactionWithWalletEvent =
	EventType<'signTransactionWithWallet'> &
		EventValue<{ publicKey: PublicKey; signature: Buffer }>;

export type SignTransactionWithKeypairEvent =
	EventType<'signTransactionWithKeypair'> & EventValue<Keypair>;

export type SignTransactionMachineEvent =
	| RestartEvent
	| StartSigningEvent
	| SignTransactionWithWalletEvent
	| SignTransactionWithKeypairEvent;

export type SignTransactionMachineServices = {
	'Sign transaction': {
		data: Transaction;
	};
};

export const signTransactionMachineFactory = (config?: {
	fireAndForget: boolean;
}) => {
	/** @xstate-layout N4IgpgJg5mDOIC5QGUCWUB2ACALgJwEMNYCBjHVAe2wFsyALVDMAOgBVDiyLqtZ1mEAMSJQAB0r8eGUSAAeiAIwB2ZS0UAGAKwAWZSoBMANgCcJjTqMAaEAE9EAWkU6AHCwDMJoxpcv3OxRcDRUUAX1CbNExcThJyKloGJlYo7HwiOOkhfkwODO4EgHVUHHoAaTBbMQJUPFkJKQTZBQQnZQMPIPcDZSNVEwMTdxt7VvcjFj0tA09FLU0jSx1wyIEY-PjeOlJGZhZU9a5NjGyBPKPpYtLCggAbW7AceskSpqR5RyMDLRZlHXnnEZAiFfCNHONJspprN5hpFosViADukLgksNtdik1ijMgkRO8Gq9qM1HCENOo4d5FEZuu1lBphnZHMF3CwzBpvsZtC5-iZEcjYgUtklmNkcAQ8DhUkwoM9GsT3i0HJ4dOoTIpvir-BoNCZlGDWgZfCwZnp1YpujNdOEIiAMJQIHBZAKNtJ0SLWABJCAPOVEmSKxxaEw-dwWEw6XUzcxaA0OQaKE0aRQRsMGDR-cbKfnYwXHd07ZLsPNunKCP3SEkIfwefxaFwMmm9fSM0bK-5shZDUzzZa2l2o4WFvYD3EK8QvSuBsYN37+MxAoxaRbKVuk3QsFxeXXL1SaFxzHPRHFCxLD1gAEWoYArb1ALQMMw8BgCyjMPOpDP1TIQRpY0ymPoAhcel9BcI80hLNEMWSW9xw+VpFhMX5-hCSxgUCFw4x0MNO0pfw-BceYbVCIA */
	return createMachine(
		{
			context: {
				transaction: undefined as Transaction | undefined,
				signatures: [] as SignaturePubkeyPair[],
			},
			tsTypes: {} as import('./sign-transaction.machine.typegen').Typegen0,
			schema: {
				events: {} as SignTransactionMachineEvent,
				services: {} as SignTransactionMachineServices,
			},
			on: {
				startSigning: {
					actions: 'Save transaction in context',
					target: '.Sign transaction',
				},
			},
			initial: 'Idle',
			states: {
				Idle: {},
				'Transaction signed': {
					entry: 'Save transaction signed in context',
					always: {
						cond: 'is fire and forget',
						target: 'Done',
					},
				},
				'Sign transaction': {
					always: {
						cond: 'signatures done',
						target: 'Transaction signed',
					},
					on: {
						signTransactionWithKeypair: {
							actions: 'Sign using keypair',
							cond: 'valid signer',
						},
						signTransactionWithWallet: {
							actions: 'Save signature in context',
							cond: 'valid signer',
						},
					},
				},
				Done: {
					type: 'final',
				},
			},
			id: 'Sign transaction machine',
		},
		{
			actions: {
				'Save transaction in context': assign({
					transaction: (_, event) => event.value,
					signatures: (_) => [],
				}),
				'Save transaction signed in context': assign({
					transaction: (context) => {
						const transaction = new Transaction();

						transaction.feePayer = context.transaction?.feePayer;
						transaction.recentBlockhash = context.transaction?.recentBlockhash;
						transaction.lastValidBlockHeight =
							context.transaction?.lastValidBlockHeight;
						transaction.add(...(context.transaction?.instructions ?? []));

						context.signatures.forEach(({ publicKey, signature }) => {
							if (signature !== null) {
								transaction.addSignature(publicKey, signature);
							}
						});

						return transaction;
					},
				}),
				'Save signature in context': assign({
					signatures: (context, event) => [
						...context.signatures,
						{
							publicKey: event.value.publicKey,
							signature: event.value.signature,
						},
					],
				}),
				'Sign using keypair': assign({
					signatures: ({ transaction, signatures }, event) => {
						if (transaction === undefined) {
							return signatures;
						}

						return [
							...signatures,
							{
								publicKey: event.value.publicKey,
								signature: Buffer.from(
									sign.detached(
										transaction.compileMessage().serialize(),
										event.value.secretKey
									)
								),
							},
						];
					},
				}),
			},
			guards: {
				'signatures done': (context) => {
					const transaction = new Transaction();

					transaction.feePayer = context.transaction?.feePayer;
					transaction.recentBlockhash = context.transaction?.recentBlockhash;
					transaction.lastValidBlockHeight =
						context.transaction?.lastValidBlockHeight;
					transaction.add(...(context.transaction?.instructions ?? []));

					context.signatures.forEach(({ publicKey, signature }) => {
						if (signature !== null) {
							transaction.addSignature(publicKey, signature);
						}
					});

					console.log({ signaturesDone: transaction?.verifySignatures() });

					return transaction?.verifySignatures() ?? false;
				},
				'valid signer': ({ transaction }, event) => {
					if (transaction === undefined) {
						return false;
					}

					const message = transaction.compileMessage();
					const accountIndex = message.accountKeys.findIndex((accountKey) =>
						accountKey.equals(event.value.publicKey)
					);

					return message.isAccountSigner(accountIndex);
				},
				'is fire and forget': () => config?.fireAndForget ?? false,
			},
		}
	);
};

export const signTransactionServiceFactory = (config?: {
	fireAndForget: boolean;
}) => {
	return interpret(signTransactionMachineFactory(config));
};
