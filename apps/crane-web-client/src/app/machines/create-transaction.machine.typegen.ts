// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    'Save fee payer, instruction and transaction in context': 'createTransaction';
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
  matchesStates: 'Idle' | 'Transaction created' | 'Done';
  tags: never;
}
