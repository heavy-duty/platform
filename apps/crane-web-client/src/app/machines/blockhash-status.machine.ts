import { Connection, SlotInfo } from '@solana/web3.js';
import { ActorRefFrom, assign, createMachine, interpret, spawn } from 'xstate';
import { rpcRequestMachineFactory } from './rpc-request.machine';
import { EventData, EventType, EventValue } from './types';

type GetSlotEvent = EventType<'getSlot'>;

type UpdateSlotEvent = EventType<'updateSlot'> & EventValue<SlotInfo>;

type GetSlotSuccessEvent = EventType<'get-slot.Request succeeded'> &
  EventData<number>;

type GetLatestBlockhashSuccessEvent =
  EventType<'get-latest-blockhash.Request succeeded'> &
    EventData<{ blockhash: string; lastValidBlockHeight: number }>;

type BlockhashStatusMachineEvent =
  | GetSlotSuccessEvent
  | GetLatestBlockhashSuccessEvent
  | GetSlotEvent
  | UpdateSlotEvent;

export const blockhashStatusMachineFactory = (
  connection: Connection,
  config?: { fireAndForget: boolean }
) => {
  const getSlotMachine = () =>
    rpcRequestMachineFactory(() => connection.getSlot(), {
      eager: true,
      fireAndForget: true,
      name: 'get-slot',
    });

  const getLatestBlockhashMachine = () =>
    rpcRequestMachineFactory(() => connection.getLatestBlockhash(), {
      eager: true,
      fireAndForget: true,
      name: 'get-latest-blockhash',
    });

  /** @xstate-layout N4IgpgJg5mDOIC5QCEA2B7AxgawBYENZcACAZQBd9yBXWYgWX01wEsA7MAOgHExzz2UYrAzkAxDHIBaEenKcASmACO1OOWHVMmMJEiJQAB3SwWA9GwMgAHoikAWABwBWTgHYAzB4BsAJl8AjACc-h6OHgA0IACeiAEe9pwADAF+Sd4B9pluzr4AvnlRaFh4hCQUVLQMTKwcnADqVMyCwqLClDSwYtSGEFRgpKJWxqbmlkg2dgGenPGO3t4eQc5h-s5uUbEIUgFJrh6pno72Sb7Hvm7eBUUYOAREZB1VjM11jeSvQrIasE9dwyYzCwLFZbAhMh5OD5nOs3CF7N43EjHJspoFkgFnCcAgFHI5fIi3NcQMU7mVHpU6C9alxBnJiOwAG74VAsCBiAGjYHjUBghJBTguS5JE6+MKOIJBVHgrzuXxOVL+U7BZzE0mlB4VTrVV5cXj8Fqofq-YgAI1uGtwEj4UiN5HUUnNJXuuEUKjUJtgWh0eggnKBIImYKkjiSyUuyyCjjcvj2QXi0o8SUcySSQW8TnsgWjwQ8aotLop2up7DA1vIdPI-rGoLsWUhQWTfhWgXssOlO3CnHsS0R0YS2OWBUKIDY6AgcCs6sLWueNVLPD4AjYXyGExGAZ5k22zhF7lOYU8S1bbY7CM4WNyCQzGUxSXS+ed5NnVPnbyatVX9N+lOr3Nr2wxt2mQIt4ziht4abgdKuwBHKCreOEobBPYQSPmSmp-DqNKcJWDJsMyrJ+uugI1kGiBZHBR5Jm48S5Iivgds43gYisITyh4Sq7FcI7Ts+WElnUAAiFhgH+ga8ogvbhosGZOMsTaJui97ps4uxBKh+I8TcT6YZS2ELgAkhAqBiSRXISduUjeBpnDxm4aaSgs9hwpEMRTHu3HhLebjHCh6GWkWc66ouBorsQdrqGaBZlOJW7Blibh2QezhORm6zSr4ywXmmCw5MssYZESvExXpxZvmZRikf+5GAbidnTI56YZq5HYEimPbpuEwqcbiw55EAA */
  return createMachine(
    {
      context: {
        blockhash: undefined as string | undefined,
        lastValidBlockHeight: undefined as number | undefined,
        initialSlot: undefined as number | undefined,
        currentSlot: undefined as number | undefined,
        initialGap: undefined as number | undefined,
        currentGap: undefined as number | undefined,
        percentage: undefined as number | undefined,
        getSlotRef: undefined as
          | ActorRefFrom<ReturnType<typeof getSlotMachine>>
          | undefined,
        getLatestBlockhashRef: undefined as
          | ActorRefFrom<ReturnType<typeof getLatestBlockhashMachine>>
          | undefined,
        isValid: undefined as boolean | undefined,
      },
      tsTypes: {} as import('./blockhash-status.machine.typegen').Typegen0,
      schema: { events: {} as BlockhashStatusMachineEvent },
      on: {
        getSlot: {
          target: '.Getting slot',
        },
      },
      initial: 'Idle',
      states: {
        'Getting slot': {
          entry: 'Start get slot machine',
          on: {
            'get-slot.Request succeeded': {
              actions: 'Save initial slot in context',
              target: 'Getting latest blockhash',
            },
          },
        },
        'Watching slot status': {
          invoke: {
            src: 'Subscribe to slot changes',
          },
          always: {
            actions: 'Mark as invalid in context',
            cond: 'slot invalid',
            target: 'Slot invalid',
          },
          on: {
            updateSlot: {
              actions: 'Update slot and gaps in context',
            },
          },
        },
        'Slot invalid': {
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
              target: 'Watching slot status',
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
        'Save initial slot in context': assign({
          initialSlot: (_, event) => event.data,
        }),
        'Update slot and gaps in context': assign({
          currentSlot: (_, event) => event.value.slot,
          currentGap: (context, event) =>
            (context.lastValidBlockHeight ?? 0) - event.value.slot,
          percentage: (context, event) =>
            Math.floor(
              (((context.lastValidBlockHeight ?? 0) - event.value.slot) * 100) /
                (context.initialGap ?? 1)
            ),
        }),
        'Save latest blockhash in context': assign({
          blockhash: (_, event) => event.data.blockhash,
          lastValidBlockHeight: (_, event) => event.data.lastValidBlockHeight,
          initialGap: (context, event) =>
            event.data.lastValidBlockHeight - (context.initialSlot ?? 0),
          percentage: (_) => 100,
          isValid: (context, event) =>
            (context.initialSlot ?? 0) < event.data.lastValidBlockHeight,
        }),
        'Start get latest blockhash machine': assign({
          getLatestBlockhashRef: (_) =>
            spawn(getLatestBlockhashMachine(), {
              name: 'get-latest-blockhash',
            }),
        }),
        'Start get slot machine': assign({
          getSlotRef: (_) =>
            spawn(getSlotMachine(), {
              name: 'get-slot',
            }),
        }),
      },
      guards: {
        'slot invalid': (context) => context.percentage === 0,
        'is fire and forget': () => config?.fireAndForget ?? false,
      },
      services: {
        'Subscribe to slot changes': () => (callback) => {
          const id = connection.onSlotChange((slotInfo) =>
            callback({ type: 'updateSlot', value: slotInfo })
          );

          return () => connection.removeSlotChangeListener(id);
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
