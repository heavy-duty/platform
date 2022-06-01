import { Connection, TransactionSignature } from '@solana/web3.js';
import { ActorRefFrom, assign, createMachine, interpret, spawn } from 'xstate';
import {
  rpcRequestMachineFactory,
  RpcRequestSuccess,
} from './rpc-request.machine';
import { EventType, EventValue } from './types';

type StartConfirmingEvent = EventType<'startConfirming'> &
  EventValue<TransactionSignature>;
type ConfirmTransactionEvent = EventType<'confirmTransaction'>;

type ConfirmTransactionMachineEvent =
  | RpcRequestSuccess<TransactionSignature>
  | ConfirmTransactionEvent
  | StartConfirmingEvent;

export const confirmTransactionMachineFactory = (
  connection: Connection,
  config?: { fireAndForget: boolean }
) => {
  const confirmTransactionFactory = (signature: TransactionSignature) =>
    rpcRequestMachineFactory(() => connection.confirmTransaction(signature), {
      eager: true,
      fireAndForget: true,
    });

  /** @xstate-layout N4IgpgJg5mDOIC5QGED2A7AZgSwE4FsACAF1wEN1YyBjY7DQ-GgC23TADo0s982oS5SjToYAxACUADtUISwARwCucYoQCyLNp3nLVhWEurUwkSIlBTUsbKPQWQAD0QBaAEwBWAJwc3AZgA2ABYPAHZ-AK8ADgAGNyCAGhAAT1c3KI5QmI8grz8QoJjAjwBGIIBfcqTuHAJBCipaenRGLXYOABUhRrtCagxa-EgxBysbOwdnBBK3UI4PGMKoqK8gkpis7KTUhBcSko4AgI9SkJLws+DK6oHeeuEmhiZqVnaAZWwodDJiJVwwQj-MgQZJifo8AhdBoiZqjay2WFIJyucJuDgrGLHUL7VarALbRAzNEBLK5NzRPxxNyLa4gGp3UjQx4tZ6vMBiWDEMi4Yj0gj8OHjRGgKYuBZoqLnKIhSIBPxRUL4lKuc4eDheWZRPyzSmLI6VKogdCoCBwBx8oiMh69VnaDgASQgABswIKERhJq5ggdzvKglFvOFgm4CbtPD54jFojF9gE3P4SrSLfces1Wi87Rb+CmYR6kWN3fYkaKQj5Qh5gqENUE-B4VqFQ14YodSV4jtK6wEk7c6lbU082pwoda0+DBuZ8-CJsWvT4Ssc67EitKvHlQ3sgkEOJSggESlrpek5d2IZburmWYOOAARDCuydCvMiwmhPyZePS-1+Ep1jUN5XTH4b6rk22oeOSAZ+G2J6DDmzLpmyHAfF8Px-ACQIgm607Prsr4HJSeQauBu4xokAEuFW6rxhq0oBFEkT+jBDLnvBtrsFhwrIrhJzblGUGePEASkeu+RbpG0ZrJibiRB4BrlEAA */
  return createMachine(
    {
      context: {
        signature: undefined as TransactionSignature | undefined,
        error: undefined as unknown,
        confirmTransactionRef: undefined as
          | ActorRefFrom<ReturnType<typeof confirmTransactionFactory>>
          | undefined,
      },
      tsTypes: {} as import('./confirm-transaction.machine.typegen').Typegen0,
      schema: { events: {} as ConfirmTransactionMachineEvent },
      on: {
        startConfirming: {
          actions: 'Save signature in context',
          target: '.Signature ready',
        },
      },
      initial: 'Idle',
      states: {
        Idle: {},
        'Confirming transaction': {
          entry: 'Start confirm transaction machine',
          on: {
            'Rpc Request Machine.Request succeeded': {
              target: 'Transaction confirmed',
            },
          },
        },
        'Transaction confirmed': {
          always: {
            cond: 'is fire and forget',
            target: 'Done',
          },
        },
        Done: {
          type: 'final',
        },
        'Signature ready': {
          on: {
            confirmTransaction: {
              target: 'Confirming transaction',
            },
          },
        },
      },
      id: 'Confirm transaction machine',
    },
    {
      actions: {
        'Start confirm transaction machine': assign({
          confirmTransactionRef: ({ signature }) =>
            signature
              ? spawn(confirmTransactionFactory(signature), {
                  name: 'confirm-transaction',
                })
              : undefined,
        }),
        'Save signature in context': assign({
          signature: (_, event) => event.value,
        }),
      },
      guards: {
        'is fire and forget': () => config?.fireAndForget ?? false,
      },
    }
  );
};

export const confirmTransactionServiceFactory = (
  connection: Connection,
  config?: { fireAndForget: boolean }
) => {
  return interpret(confirmTransactionMachineFactory(connection, config));
};
