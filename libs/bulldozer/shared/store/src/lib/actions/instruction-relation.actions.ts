import { InstructionRelation, Relation } from '@heavy-duty/bulldozer-devkit';
import { Action, InstructionRelationActionTypes } from './types';

export class InstructionRelationCreated implements Action<void> {
  type = InstructionRelationActionTypes.InstructionRelationCreated;
}

export class InstructionRelationUpdated
  implements Action<Relation<InstructionRelation>>
{
  type = InstructionRelationActionTypes.InstructionRelationUpdated;

  constructor(public payload: Relation<InstructionRelation>) {}
}

export class InstructionRelationDeleted implements Action<string> {
  type = InstructionRelationActionTypes.InstructionRelationDeleted;

  constructor(public payload: string) {}
}

export type InstructionRelationActions =
  | InstructionRelationCreated
  | InstructionRelationUpdated
  | InstructionRelationDeleted;
