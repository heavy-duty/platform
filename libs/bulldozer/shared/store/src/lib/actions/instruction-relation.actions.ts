import {
  Action,
  INSTRUCTION_RELATION_CREATED,
  INSTRUCTION_RELATION_DELETED,
  INSTRUCTION_RELATION_UPDATED,
} from './types';

export class InstructionRelationCreated implements Action<void> {
  type: typeof INSTRUCTION_RELATION_CREATED = INSTRUCTION_RELATION_CREATED;
}

export class InstructionRelationUpdated implements Action<string> {
  type: typeof INSTRUCTION_RELATION_UPDATED = INSTRUCTION_RELATION_UPDATED;

  constructor(public payload: string) {}
}

export class InstructionRelationDeleted implements Action<string> {
  type: typeof INSTRUCTION_RELATION_DELETED = INSTRUCTION_RELATION_DELETED;

  constructor(public payload: string) {}
}

export type InstructionRelationActions =
  | InstructionRelationCreated
  | InstructionRelationUpdated
  | InstructionRelationDeleted;
