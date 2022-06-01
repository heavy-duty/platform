import { Connection, Transaction, TransactionSignature } from '@solana/web3.js';
import { ActorRefFrom, assign, createMachine, interpret, spawn } from 'xstate';
import {
  rpcRequestMachineFactory,
  RpcRequestSuccess,
} from './rpc-request.machine';
import { EventType, EventValue } from './types';

type StartSendingEvent = EventType<'startSending'> & EventValue<Transaction>;

type SendTransactionEvent = EventType<'sendTransaction'>;

type SendTransactionMachineEvent =
  | RpcRequestSuccess<TransactionSignature>
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
      }
    );

  /** @xstate-layout N4IgpgJg5mDOIC5QGUwDsIAIAuAnAhmrPgMbYCWA9mpgLakAW5aYAdKhs1DgUaRdQDEAJQAOJTMLABHAK5xsmALKNmbKXIWZYskiTCRIiUKMqxyAtMZAAPRAFoAbI9YBmAIwBOAEyfPrz0cABgB2bxCAGhAATwcQ1gAOEIBWJJCQhNcAFiz3DwSAXwKojiw8QmIyKhp6EiYWVgAVXkrLbXRsQWtTc0trOwRXcNZvPMdXbMd3KNiEezzk1ncszwTk9yDU1wT3cKKS9DKW-mq6VQbmipPqTFwwfAhowVhDy74q6m6zC2r+h1cwqwQrktgkgp5ckEgq4Zg5PPFXI4smFtiDgSFPPsQKUeFcPjVzmBnth8LhsKUuF9er8kLYHFlNqwgrlgkFvNtlslxrC5r53Kwst4EkKgpkNkKQkViiA0JQIHBrDjyu82rV6mwAJIQAA2YCpP0+tIGuyCrE87h2UPcyRyUOS3h59m8yVNiPSovG7mtDMl0qVx3xZzqanYhy4uJVNJM3z6Rvp6SW5uCri5yXWFsd3ldKQSCT8jhtu0cKSx-rxqsJTQDbReaGw+tjoAG3kSwKy4yFyyy22cjuW-KRqy2-mcmW8pcOEdapzVIYAItQ9bSegarHHBoCkgXwbnHIEdpEYohFrsGcKXRMhtDXBOMFPrgTgxdq6c7g9ZtHqYam-9Aol4ZkHjIi6jh9hiIy5q4bIZEEwQbL6Bx3sq043LOLANlGdJzC6-JeO4yapumCSOgCLiCsKOy7DaQzJDeUpAA */
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
            'Rpc Request Machine.Request succeeded': {
              actions: 'Save signature in context',
              target: 'Transaction sent',
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
      },
      id: 'Send transaction machine',
    },
    {
      actions: {
        'Save signature in context': assign({
          signature: (_, event) => event.data,
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
