// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    'Remove response from context': 'restartMachine';
    'Save response in context': 'done.invoke.Rpc Request Machine.Sending Request:invocation[0]';
    'Save error in context': 'error.platform.Rpc Request Machine.Sending Request:invocation[0]';
  };
  internalEvents: {
    'done.invoke.Rpc Request Machine.Sending Request:invocation[0]': {
      type: 'done.invoke.Rpc Request Machine.Sending Request:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.Rpc Request Machine.Sending Request:invocation[0]': {
      type: 'error.platform.Rpc Request Machine.Sending Request:invocation[0]';
      data: unknown;
    };
    '': { type: '' };
    'xstate.after(5000)#Rpc Request Machine.Sleeping': {
      type: 'xstate.after(5000)#Rpc Request Machine.Sleeping';
    };
    'xstate.init': { type: 'xstate.init' };
  };
  invokeSrcNameMap: {
    'Send request': 'done.invoke.Rpc Request Machine.Sending Request:invocation[0]';
  };
  missingImplementations: {
    actions:
      | 'Remove response from context'
      | 'Save response in context'
      | 'Save error in context';
    services: 'Send request';
    guards:
      | 'auto start enabled'
      | 'is network failed error'
      | 'is fire and forget';
    delays: never;
  };
  eventsCausingServices: {
    'Send request':
      | 'request'
      | ''
      | 'xstate.after(5000)#Rpc Request Machine.Sleeping';
  };
  eventsCausingGuards: {
    'auto start enabled': '';
    'is network failed error': 'error.platform.Rpc Request Machine.Sending Request:invocation[0]';
    'is fire and forget': '';
  };
  eventsCausingDelays: {};
  matchesStates:
    | 'Idle'
    | 'Sending Request'
    | 'Request succeeded'
    | 'Request failed'
    | 'Sleeping'
    | 'Request done';
  tags: never;
}
