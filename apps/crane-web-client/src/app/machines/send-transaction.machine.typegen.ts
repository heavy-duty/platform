// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    'Save transaction in context': 'startSending';
    'Save signature in context': 'Rpc Request Machine.Request succeeded';
    'Start send raw transaction machine': 'sendTransaction';
  };
  internalEvents: {
    '': { type: '' };
    'xstate.init': { type: 'xstate.init' };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {};
  eventsCausingGuards: {
    'is fire and forget': '';
  };
  eventsCausingDelays: {};
  matchesStates:
    | 'Idle'
    | 'Sending transaction'
    | 'Transaction sent'
    | 'Done'
    | 'Transaction ready';
  tags: never;
}
