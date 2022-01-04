import { Document, InstructionRelation } from '@heavy-duty/bulldozer-devkit';
import { Action, InstructionRelationActionTypes } from './types';

export class InstructionRelationCreated implements Action<void> {
  type = InstructionRelationActionTypes.InstructionRelationCreated;
}

export class InstructionRelationUpdated
  implements Action<Document<InstructionRelation>>
{
  type = InstructionRelationActionTypes.InstructionRelationUpdated;

  constructor(public payload: Document<InstructionRelation>) {}
}

export class InstructionRelationDeleted implements Action<string> {
  type = InstructionRelationActionTypes.InstructionRelationDeleted;

  constructor(public payload: string) {}
}

export type InstructionRelationActions =
  | InstructionRelationCreated
  | InstructionRelationUpdated
  | InstructionRelationDeleted;
