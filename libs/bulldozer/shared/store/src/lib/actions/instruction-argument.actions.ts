import {
  Action,
  INSTRUCTION_ARGUMENT_CREATED,
  INSTRUCTION_ARGUMENT_DELETED,
  INSTRUCTION_ARGUMENT_UPDATED,
} from './types';

export class InstructionArgumentCreated implements Action<void> {
  type: typeof INSTRUCTION_ARGUMENT_CREATED = INSTRUCTION_ARGUMENT_CREATED;
}

export class InstructionArgumentUpdated implements Action<string> {
  type: typeof INSTRUCTION_ARGUMENT_UPDATED = INSTRUCTION_ARGUMENT_UPDATED;

  constructor(public payload: string) {}
}

export class InstructionArgumentDeleted implements Action<string> {
  type: typeof INSTRUCTION_ARGUMENT_DELETED = INSTRUCTION_ARGUMENT_DELETED;

  constructor(public payload: string) {}
}

export type InstructionArgumentActions =
  | InstructionArgumentCreated
  | InstructionArgumentUpdated
  | InstructionArgumentDeleted;
