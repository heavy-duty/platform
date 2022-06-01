// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    'Save initial slot in context': 'get-slot.Request succeeded';
    'Update slot and gaps in context': 'updateSlot';
    'Mark as invalid in context': '';
    'Save latest blockhash in context': 'get-latest-blockhash.Request succeeded';
    'Start get slot machine': 'getSlot';
    'Start get latest blockhash machine': 'get-slot.Request succeeded';
  };
  internalEvents: {
    '': { type: '' };
    'xstate.init': { type: 'xstate.init' };
  };
  invokeSrcNameMap: {
    'Subscribe to slot changes': 'done.invoke.Blockhash Status Machine.Watching slot status:invocation[0]';
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    'Subscribe to slot changes': 'get-latest-blockhash.Request succeeded';
  };
  eventsCausingGuards: {
    'slot invalid': '';
    'is fire and forget': '';
  };
  eventsCausingDelays: {};
  matchesStates:
    | 'Getting slot'
    | 'Watching slot status'
    | 'Slot invalid'
    | 'Done'
    | 'Idle'
    | 'Getting latest blockhash';
  tags: never;
}
