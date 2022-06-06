import {
	PublicKey,
	Transaction,
	TransactionInstruction,
} from '@solana/web3.js';
import { assign, createMachine, interpret } from 'xstate';
import { EventType, EventValue } from './types';

type CreateTransactionEvent = EventType<'createTransaction'> &
	EventValue<{
		feePayer: PublicKey;
		instructions: TransactionInstruction[];
	}>;

export type CreateTransactionMachineEvent = CreateTransactionEvent;

export const createTransactionMachineFactory = (config?: {
	fireAndForget: boolean;
}) => {
	/** @xstate-layout N4IgpgJg5mDOIC5QGEBOYCGAXMACAKqhgHawYDGWAlgPbG4CyFAFlcWAHSElmW33l02SAGJEoAA41YVanXEgAHogC0AVgAsHABwBGAGwB2bRrW6ADBt0BmNdYA0IAJ6qN18xwBM5z9e3GATg1PNX1tAF9wxzRMHAIiUgo5eiZyVnYRQViwbkS+eSQQKRlkhWUEFQ0Aj099T39-HwDtc3N9RxcK-TaOXRazKyNPXTU1SKiQYhoIOAUY4XieJP5GFjZOAEkIABswBWLZfjLEC08Oav1Na09DZqr9DQ7VMLUODVbTd40qt09I6KEcVyvGSqzS6y4CRBKyywgg+2khwKoHKlSCHFs+n0fm0elMwyeFQ0dS8Pj8ngCIUManq-xA8yBUOWdDB6U4ABE6HtCgdSoVyt5tBxDMTzAY1K1DMZtO1nKo-FpDGSAoZ9JTLL46Qy8MDmSk1uwESUjvzVGYhZjsbi8TTdISVFKPO9LHVmgF3eZDONwkA */
	return createMachine(
		{
			context: {
				feePayer: undefined as PublicKey | undefined,
				instructions: undefined as TransactionInstruction[] | undefined,
				transaction: undefined as Transaction | undefined,
			},
			tsTypes: {} as import('./create-transaction.machine.typegen').Typegen0,
			schema: { events: {} as CreateTransactionMachineEvent },
			on: {
				createTransaction: {
					actions: 'Save fee payer and instruction in context',
					target: '.Transaction created',
				},
			},
			id: 'Create Transaction Machine',
			initial: 'Idle',
			states: {
				Idle: {},
				'Transaction created': {
					entry: 'Save transaction in context',
					always: {
						cond: 'is fire and forget',
						target: 'Done',
					},
				},
				Done: {
					type: 'final',
				},
			},
		},
		{
			actions: {
				'Save fee payer and instruction in context': assign({
					instructions: (_, event) => event.value.instructions,
					feePayer: (_, event) => event.value.feePayer,
				}),
				'Save transaction in context': assign({
					transaction: (context) => {
						const transaction = new Transaction().add(
							...(context.instructions ?? [])
						);

						transaction.feePayer = context.feePayer;

						return transaction;
					},
				}),
			},
			guards: {
				'is fire and forget': () => config?.fireAndForget ?? false,
			},
		}
	);
};

export const createTransactionServiceFactory = (config?: {
	fireAndForget: boolean;
}) => {
	return interpret(createTransactionMachineFactory(config));
};
