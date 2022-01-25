import {
  Action,
  INSTRUCTION_BODY_UPDATED,
  INSTRUCTION_CREATED,
  INSTRUCTION_DELETED,
  INSTRUCTION_UPDATED,
} from './types';

export class InstructionCreated implements Action<void> {
  type: typeof INSTRUCTION_CREATED = INSTRUCTION_CREATED;
}

export class InstructionUpdated implements Action<string> {
  type: typeof INSTRUCTION_UPDATED = INSTRUCTION_UPDATED;

  constructor(public payload: string) {}
}

export class InstructionDeleted implements Action<string> {
  type: typeof INSTRUCTION_DELETED = INSTRUCTION_DELETED;

  constructor(public payload: string) {}
}

export class InstructionBodyUpdated implements Action<string> {
  type: typeof INSTRUCTION_BODY_UPDATED = INSTRUCTION_BODY_UPDATED;

  constructor(public payload: string) {}
}

export type InstructionActions =
  | InstructionCreated
  | InstructionUpdated
  | InstructionBodyUpdated
  | InstructionDeleted;
