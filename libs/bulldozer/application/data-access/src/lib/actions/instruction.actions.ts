import { Action, InstructionActionTypes } from './types';

export class InstructionInit implements Action<void> {
  type = InstructionActionTypes.InstructionInit;
}

export class InstructionCreated implements Action<void> {
  type = InstructionActionTypes.InstructionCreated;
}

export class InstructionUpdated implements Action<string> {
  type = InstructionActionTypes.InstructionUpdated;

  constructor(public payload: string) {}
}

export class InstructionDeleted implements Action<string> {
  type = InstructionActionTypes.InstructionDeleted;

  constructor(public payload: string) {}
}

export class InstructionBodyUpdated implements Action<string> {
  type = InstructionActionTypes.InstructionBodyUpdated;

  constructor(public payload: string) {}
}

export class InstructionArgumentCreated implements Action<void> {
  type = InstructionActionTypes.InstructionArgumentCreated;
}

export class InstructionArgumentUpdated implements Action<string> {
  type = InstructionActionTypes.InstructionArgumentUpdated;

  constructor(public payload: string) {}
}

export class InstructionArgumentDeleted implements Action<string> {
  type = InstructionActionTypes.InstructionArgumentDeleted;

  constructor(public payload: string) {}
}

export class InstructionAccountCreated implements Action<void> {
  type = InstructionActionTypes.InstructionAccountCreated;
}

export class InstructionAccountUpdated implements Action<string> {
  type = InstructionActionTypes.InstructionAccountUpdated;

  constructor(public payload: string) {}
}

export class InstructionAccountDeleted implements Action<string> {
  type = InstructionActionTypes.InstructionAccountDeleted;

  constructor(public payload: string) {}
}

export type InstructionActions =
  | InstructionInit
  | InstructionCreated
  | InstructionUpdated
  | InstructionDeleted
  | InstructionArgumentCreated
  | InstructionArgumentUpdated
  | InstructionArgumentDeleted
  | InstructionAccountCreated
  | InstructionAccountUpdated
  | InstructionAccountDeleted;
