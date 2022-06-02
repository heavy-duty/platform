import { Connection } from '@solana/web3.js';
import { ActorRefFrom, assign, createMachine, interpret, spawn } from 'xstate';
import { rpcRequestMachineFactory } from './rpc-request.machine';
import { EventData, EventType, EventValue } from './types';

type GetBlockHeightEvent = EventType<'getBlockHeight'>;

type UpdateBlockHeightEvent = EventType<'updateBlockHeight'> &
	EventValue<number>;

type GetBlockHeightSuccessEvent =
	EventType<'get-block-height.Request succeeded'> & EventData<number>;

type GetLatestBlockhashSuccessEvent =
	EventType<'get-latest-blockhash.Request succeeded'> &
		EventData<{ blockhash: string; lastValidBlockHeight: number }>;

type BlockhashStatusMachineEvent =
	| GetBlockHeightSuccessEvent
	| GetLatestBlockhashSuccessEvent
	| GetBlockHeightEvent
	| UpdateBlockHeightEvent;

export const blockhashStatusMachineFactory = (
	connection: Connection,
	config?: { fireAndForget: boolean }
) => {
	const getBlockHeightMachine = () =>
		rpcRequestMachineFactory(() => connection.getBlockHeight(), {
			eager: true,
			fireAndForget: true,
			name: 'get-block-height',
		});

	const getLatestBlockhashMachine = () =>
		rpcRequestMachineFactory(() => connection.getLatestBlockhash(), {
			eager: true,
			fireAndForget: true,
			name: 'get-latest-blockhash',
		});

	/** @xstate-layout N4IgpgJg5mDOIC5QCEA2B7AxgawBYENZcACAZQBd9yBXWYgWX01wEsA7MAOgHExzz2UYgCMMOYrjAsoucgGIY5ALSis2JZOmzOAJTABHanHLFY1TJjCRIiUAAd0sFgPRtbIAB6IlAFgDMnACMAEwAnME+AAwAHACssQDskcGxfj4ANCAAnoh+AbE+odEJfimBoT5hsQC+1ZloagREZJQ0dIzM7FwA6lSdbEKq4poyJrCttHLUdhBUYA04ABJSo+4OTi5uSJ7eJYGc0eEAbIexoX6RfkexmTkIoaGcwZF7fgmBeecptfVieIQkChUWgMJisDicXrkfqDP4SFayUwTWByNaOZwsVzuLwIJQlYKcULxQLRN6lI5+aKBW65CqcE7BK7xErvM4JH4gBb-ZpAtqg-pcLlNEjsABu+FQLAgqO26wxWO2OLxCU4UUiDx8sUCPkCkQpwRpCH8R0JcUZ-gSwWCpL8HKFAJawPaYK6PD4AgGxFQc3GIj+woUfCU3vIxhU-oBugMRl9ZgsVggNll6M22O8lUesWusWCHwS0U1iQy2UQKR89LyCQKPn8eSiRztEZ5yP54LAgfIXOWWnIaI2mK2oCVaQJKQuR01R3zFVChqURwJZ3Kup80RtrNqdRAbHQifg23tzadrddvH4gj9anhPb78sHO1x-nLflCJ0ilReWbyhtznHfRSOXUjgeVkC0bRoHV5EEOjbSE+nBWErxGRFxidW9U0VXZYkiThEhfLUtRrSI9R-SogkrSpgkAq5ghKcCcGFR0+Rg11DxFNhxUlCB0IHNNcSuaInmzXUqQLKjSUNfwcNXHMQkOS0YnfejuUBFsWIhAARVwwB4hUh1LPJ6Snd4a2ic1QkuSSLlVM05NCBToiUrc2KY6CXQhABJCBUB05N+z0h95zpUJAiSB5XwnBJzjnFcgj1UlANCgtyh8ZTGKg50BTdc9PRDYxLwYgFdPvJUqyEyJsMqSpKRq0iCQ+N4TiZWJihCNLILU9zfPsFNeMw3EEgScs8KJQJCLVI4YsOOKmopQDVw+BtNyAA */
	return createMachine(
		{
			context: {
				blockhash: undefined as string | undefined,
				lastValidBlockHeight: undefined as number | undefined,
				initialBlockHeight: undefined as number | undefined,
				currentBlockHeight: undefined as number | undefined,
				initialGap: undefined as number | undefined,
				currentGap: undefined as number | undefined,
				percentage: undefined as number | undefined,
				getBlockHeightRef: undefined as
					| ActorRefFrom<ReturnType<typeof getBlockHeightMachine>>
					| undefined,
				getLatestBlockhashRef: undefined as
					| ActorRefFrom<ReturnType<typeof getLatestBlockhashMachine>>
					| undefined,
				isValid: undefined as boolean | undefined,
			},
			tsTypes: {} as import('./blockhash-status.machine.typegen').Typegen0,
			schema: { events: {} as BlockhashStatusMachineEvent },
			on: {
				getBlockHeight: {
					target: '.Getting block height',
				},
			},
			initial: 'Idle',
			states: {
				'Getting block height': {
					entry: 'Start get block height machine',
					on: {
						'get-block-height.Request succeeded': {
							actions: 'Save initial block height in context',
							target: 'Getting latest blockhash',
						},
					},
				},
				'Watching block height status': {
					invoke: {
						src: 'Poll for block height',
					},
					always: {
						actions: 'Mark as invalid in context',
						cond: 'blockhash invalid',
						target: 'Blockhash invalid',
					},
					on: {
						updateBlockHeight: {
							actions: 'Update block height in context',
						},
					},
				},
				'Blockhash invalid': {
					always: {
						cond: 'is fire and forget',
						target: 'Done',
					},
				},
				Done: {
					type: 'final',
				},
				Idle: {},
				'Getting latest blockhash': {
					entry: 'Start get latest blockhash machine',
					on: {
						'get-latest-blockhash.Request succeeded': {
							actions: 'Save latest blockhash in context',
							target: 'Watching block height status',
						},
					},
				},
			},
			id: 'Blockhash Status Machine',
		},
		{
			actions: {
				'Mark as invalid in context': assign({
					isValid: (_) => false,
				}),
				'Update block height in context': assign({
					currentBlockHeight: (_, event) => event.value,
					currentGap: (context, event) =>
						(context.lastValidBlockHeight ?? 0) - event.value,
					percentage: (context, event) =>
						Math.floor(
							(((context.lastValidBlockHeight ?? 0) - event.value) * 100) /
								(context.initialGap ?? 1)
						),
				}),
				'Save latest blockhash in context': assign({
					blockhash: (_, event) => event.data.blockhash,
					lastValidBlockHeight: (_, event) => event.data.lastValidBlockHeight,
					initialGap: (context, event) =>
						event.data.lastValidBlockHeight - (context.initialBlockHeight ?? 0),
					percentage: (_) => 100,
					isValid: (context, event) =>
						(context.initialBlockHeight ?? 0) < event.data.lastValidBlockHeight,
				}),
				'Start get latest blockhash machine': assign({
					getLatestBlockhashRef: (_) =>
						spawn(getLatestBlockhashMachine(), {
							name: 'get-latest-blockhash',
						}),
				}),
				'Save initial block height in context': assign({
					initialBlockHeight: (_, event) => event.data,
				}),
				'Start get block height machine': assign({
					getBlockHeightRef: (_) =>
						spawn(getBlockHeightMachine(), {
							name: 'get-block-height',
						}),
				}),
			},
			guards: {
				'blockhash invalid': (context) => context.percentage === 0,
				'is fire and forget': () => config?.fireAndForget ?? false,
			},
			services: {
				'Poll for block height': () => (callback) => {
					const id = setInterval(async () => {
						const blockHeight = await connection.getBlockHeight();

						callback({ type: 'updateBlockHeight', value: blockHeight });
					}, 1000);

					return () => clearInterval(id);
				},
			},
		}
	);
};

export const blockhashStatusServiceFactory = (
	connection: Connection,
	config?: { fireAndForget: boolean }
) => {
	return interpret(blockhashStatusMachineFactory(connection, config));
};
