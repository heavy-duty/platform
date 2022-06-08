import { Connection, Transaction, TransactionSignature } from '@solana/web3.js';
import { ActorRefFrom, assign, createMachine, interpret, spawn } from 'xstate';
import { rpcRequestMachineFactory } from './rpc-request.machine';
import { EventData, EventType, EventValue } from './types';

type StartSendingEvent = EventType<'startSending'> & EventValue<Transaction>;

type SendTransactionEvent = EventType<'sendTransaction'>;

type SendTransactionSuccessEvent =
	EventType<'send-transaction.Request succeeded'> &
		EventData<TransactionSignature>;

type SendTransactionFailedEvent = EventType<'send-transaction.Request failed'> &
	EventData<unknown>;

type SendTransactionMachineEvent =
	| SendTransactionSuccessEvent
	| SendTransactionFailedEvent
	| StartSendingEvent
	| SendTransactionEvent;

export const sendTransactionMachineFactory = (
	connection: Connection,
	config?: { fireAndForget: boolean }
) => {
	const sendRawTransactionFactory = (transaction: Transaction) =>
		rpcRequestMachineFactory(
			() => connection.sendRawTransaction(transaction.serialize()),
			{
				eager: true,
				fireAndForget: true,
				name: 'send-transaction',
			}
		);

	/** @xstate-layout N4IgpgJg5mDOIC5QGUwDsIAIAuAnAhmrPgMbYCWA9mpgLakAW5aYAdKhs1DgUaRdQDEsdBAC0eQsTJU0rAEpgAjgFc42TLBUkSYSJESgADpVjkBaQyAAeiMQCYAzAEZWzgCzuArAHZ3ABh8ANgBOf0d7HwAaEABPO3dHVn9woMiggA5A9x97EIBffJiOLEk+GWo6RmY2Eq4eKX5ZYVEJXmkLBWU1WA0AM3xyABsDJBATMwsrWwQxZ0cQ1kyQtIyMkK97IK8MmPiEey8g1kOQyL8Fo58CopAShvKLKpImFlYAFXamypE0bEErBNzLJpogIj4TvMgo5HO4gs49nZ5l43O4QhkvM5-DtHBlnJFCsVRA8OrJnq82J9GhUaLgwPgILEWhgqY8QWMgVMxjMxI5cqw-M4cVkQu4seFEbMQhDHEEck4MmLfDkbkSMCTvjR6C8ah8vjTMANhpAARzTMDqKCEPikkFwvY1tcVViEXFEPMMqxPGEMRkfJsMrLVXdiWVSZVtRThNh8LhsHU0FBAeauaAeQEUf4xXb-AqPEdHJKHCFXO4HQ7-IGsQ6fIVbmhKBA4FZ7mHNeTdQBJCAjZOTdlp932fysEt4lJCzwpTZFw4j2U+HyV6HOSeBQkh9Vtg2R3UJ7jb1PjFMDmx2LxeRaOSu4lLw6FeSX2RICy-PvH+pfwjIb1v6p67m8rLhjQvzYH2FqWNyiD2KwfqeNCDoeIkGRBEERYeK4crojiISypkES-qG-5koBbAACLUGAEFHjyfhLJWSpOIcl4ZPYkrOGkySYsOS7SpxBK3H+1IAdUQEkZUdIMvsxgnpa0GzAsxzrD4gYuDkXj+OhbqzM41wnGs16RFkdpYrWQnESJpFiZSEk0EaIwQDRp4zC4nrDo4Xh8v6hzOCpT6hCcb7QoG2LbEERFbnZHYsM58mDrMOKsNegZZFpnGeUWfLHGWbEqcEgRpOZhRAA */
	return createMachine(
		{
			context: {
				transaction: undefined as Transaction | undefined,
				error: undefined as unknown,
				signature: undefined as TransactionSignature | undefined,
				sendRawTransactionRef: undefined as
					| ActorRefFrom<ReturnType<typeof sendRawTransactionFactory>>
					| undefined,
			},
			tsTypes: {} as import('./send-transaction.machine.typegen').Typegen0,
			schema: { events: {} as SendTransactionMachineEvent },
			on: {
				startSending: {
					actions: 'Save transaction in context',
					target: '.Transaction ready',
				},
			},
			initial: 'Idle',
			states: {
				Idle: {},
				'Sending transaction': {
					entry: 'Start send raw transaction machine',
					on: {
						'send-transaction.Request succeeded': {
							actions: 'Save signature in context',
							target: 'Transaction sent',
						},
						'send-transaction.Request failed': {
							actions: 'Save error in context',
							target: 'Transaction failed',
						},
					},
				},
				'Transaction sent': {
					always: {
						cond: 'is fire and forget',
						target: 'Done',
					},
				},
				Done: {
					type: 'final',
				},
				'Transaction ready': {
					on: {
						sendTransaction: {
							target: 'Sending transaction',
						},
					},
				},
				'Transaction failed': {
					always: {
						cond: 'is fire and forget',
						target: 'Done',
					},
				},
			},
			id: 'Send transaction machine',
		},
		{
			actions: {
				'Save signature in context': assign({
					signature: (_, event) => event.data,
				}),
				'Save error in context': assign({
					error: (_, event) => event.data,
				}),
				'Start send raw transaction machine': assign({
					sendRawTransactionRef: ({ transaction }) =>
						transaction
							? spawn(sendRawTransactionFactory(transaction), {
									name: 'send-raw-transaction',
							  })
							: undefined,
				}),
				'Save transaction in context': assign({
					transaction: (_, event) => event.value,
				}),
			},
			guards: {
				'is fire and forget': () => config?.fireAndForget ?? false,
			},
		}
	);
};

export const sendTransactionServiceFactory = (
	connection: Connection,
	config?: { fireAndForget: boolean }
) => {
	return interpret(sendTransactionMachineFactory(connection, config));
};
