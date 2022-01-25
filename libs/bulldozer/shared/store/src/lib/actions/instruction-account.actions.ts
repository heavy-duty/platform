import {
  Action,
  INSTRUCTION_ACCOUNT_CREATED,
  INSTRUCTION_ACCOUNT_DELETED,
  INSTRUCTION_ACCOUNT_UPDATED,
} from './types';

export class InstructionAccountCreated implements Action<void> {
  type: typeof INSTRUCTION_ACCOUNT_CREATED = INSTRUCTION_ACCOUNT_CREATED;
}

export class InstructionAccountUpdated implements Action<string> {
  type: typeof INSTRUCTION_ACCOUNT_UPDATED = INSTRUCTION_ACCOUNT_UPDATED;

  constructor(public payload: string) {}
}

export class InstructionAccountDeleted implements Action<string> {
  type: typeof INSTRUCTION_ACCOUNT_DELETED = INSTRUCTION_ACCOUNT_DELETED;

  constructor(public payload: string) {}
}

export type InstructionAccountActions =
  | InstructionAccountCreated
  | InstructionAccountUpdated
  | InstructionAccountDeleted;
