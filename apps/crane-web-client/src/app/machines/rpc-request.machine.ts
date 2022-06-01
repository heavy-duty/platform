import { assign, sendParent } from 'xstate';
import { createModel } from 'xstate/lib/model';
import { EventData, EventType } from './types';

export type RpcRequestSuccess<T> =
  EventType<'Rpc Request Machine.Request succeeded'> & EventData<T>;

export const rpcRequestMachineFactory = <T>(
  request: () => Promise<T>,
  config?: {
    name?: string;
    eager: boolean;
    fireAndForget: boolean;
  }
) => {
  const rpcRequestModel = createModel(
    {
      response: undefined as T | undefined,
      error: undefined as unknown,
    },
    {
      events: {
        request: () => ({}),
        respond: () => ({}),
        restartMachine: () => ({}),
      },
    }
  );

  type RpcRequestMachineServices = {
    'Send request': {
      data: T;
    };
  };

  const rpcRequestMachine =
    /** @xstate-layout N4IgpgJg5mDOIC5QCUAOBjABMsBHArnAC6YCyAhugBYCWAdmAHQCSEANmAMQBOehsRRKFQB7WDSI0RdISAAeiAEwBmRooCs6gAzqALMoAcAdiMBGAJyHlAGhABPRAFpdio413qDp04tN7dAGyW6gC+IbZoWDgExGSUtAws7FyyouKS0rIKCI7K6oqMAQF5AXoaXgb6tg45ykbq7kX5AQaK+ioBumERGNh8sRTU9EwAymB0EPRQfTECnBDSTPQAbiIA1kyRM-wkgwmj45N009E7CCsi6OQZdADaWgC6qWISUjJI8kp5jFpGWub6IxeYrmYzVJzKLS6RjqZQaf6BXS6SrFbogLanAbxYaMMYTKbbYicMDcbgibiMVBsa4AM3JAFtGBj+gI4kNEnijicWURznRVlcbvcnh80q9Mh9srliu5FAEofVlOYWr5dOCcm0tGpjP4AvU2oFQuF0b1May9jizSRYPh0OgwJBIDxiORuEQLQxnuk3lkIeo3H4tIpygE-OogurHOpQTC9OGiuZzFoDMousbmbNdtjElbMDa7Q6IE6veL3qBsspSu5firzKYa4n1JH-eYfnH8ooKkZFOY0Rmdmz9kyeZgaeQaBwIM6BK73dmwCWbr6cv6tW18gZzK5E8iApHdEZoUGVFotMpU0ZQUZlH3TSOPZsR2OJ8XRS8l5LEJWGroa6UmpCPZqvYTgmIwQJGPK-w+GYna3lE97zriHBgKgUycHIM5EEw5A0th3AABTaKeACUnD9li7KjChaHHIuPqfggpgtGocJygYXj6EqQaRsxBjgTq0b5HkdYGEaxp0CIRbwB8FHmkhrAcPRErlk4Patnk9a6Fu9aQQY+4GFqHaQueSKmHC9TwYS8lUbihwElayllp8OS-owyqVpUSaWD4+SRsophuGe8ItCYRSBFZuYPsOmZ5ra9qOhATnLo4ihrueoawjodaQW0kahqYbYeJ03jBsUaY9AhsXRbmz6TsljGOAEPbueofjbm0KjKuqSZqO1LTmIeSJCZFiG2SMNFTA1qk5FqfyHkUvwBZ0liHrx9TavUfy-ECgVGKN1VIbmCyem+3oqS5hgBIwm75L8wYAqUdT7v8PyrWxKhtaGB0Dg+00uU1sKte1l6dUqe4gTkLRHnGRTXnkh43mEIRAA */
    rpcRequestModel.createMachine({
      tsTypes: {} as import('./rpc-request.machine.typegen').Typegen0,
      schema: { services: {} as RpcRequestMachineServices },
      initial: 'Idle',
      states: {
        Idle: {
          always: {
            cond: 'auto start enabled',
            target: 'Sending Request',
          },
          on: {
            request: {
              target: 'Sending Request',
            },
          },
        },
        'Sending Request': {
          invoke: {
            src: 'Send request',
            onDone: [
              {
                actions: sendParent((_, event) => ({
                  type: `${
                    config?.name ?? 'Rpc Request Machine'
                  }.Request succeeded`,
                  data: event.data,
                })),
                target: 'Request succeeded',
              },
            ],
            onError: [
              {
                actions: 'Save error in context',
                cond: 'is network failed error',
                target: 'Sleeping',
              },
              {
                target: 'Request failed',
              },
            ],
          },
        },
        'Request succeeded': {
          entry: 'Save response in context',
          always: {
            cond: 'is fire and forget',
            target: 'Request done',
          },
          on: {
            restartMachine: {
              actions: 'Remove response from context',
              target: 'Idle',
            },
          },
        },
        'Request failed': {
          entry: 'Save error in context',
          always: {
            cond: 'is fire and forget',
            target: 'Request done',
          },
          on: {
            restartMachine: {
              target: 'Idle',
            },
          },
        },
        Sleeping: {
          after: {
            '5000': {
              target: 'Sending Request',
            },
          },
        },
        'Request done': {
          type: 'final',
        },
      },
      id: 'Rpc Request Machine',
    });

  return rpcRequestMachine.withConfig(
    {
      actions: {
        'Save response in context': assign({
          response: (_, event) => event.data,
          error: (_) => undefined,
        }),
        'Save error in context': assign({
          error: (_, event) => event.data,
          response: (_) => undefined,
        }),
        'Remove response from context': assign({
          response: (_) => undefined,
        }),
      },
      guards: {
        'is fire and forget': () => config?.fireAndForget ?? false,
        'auto start enabled': () => config?.eager ?? false,
        'is network failed error': (_, event) => {
          if (!(event.data instanceof Error)) {
            return false;
          }

          return event.data.message.includes('Network request failed');
        },
      },
      services: {
        'Send request': request,
      },
    },
    {
      response: undefined as T | undefined,
      error: undefined,
    }
  );
};
