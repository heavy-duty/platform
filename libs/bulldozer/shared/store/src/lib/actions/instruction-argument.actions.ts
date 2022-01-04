import { Document, InstructionArgument } from '@heavy-duty/bulldozer-devkit';
import { Action, InstructionArgumentActionTypes } from './types';

export class InstructionArgumentCreated implements Action<void> {
  type = InstructionArgumentActionTypes.InstructionArgumentCreated;
}

export class InstructionArgumentUpdated
  implements Action<Document<InstructionArgument>>
{
  type = InstructionArgumentActionTypes.InstructionArgumentUpdated;

  constructor(public payload: Document<InstructionArgument>) {}
}

export class InstructionArgumentDeleted implements Action<string> {
  type = InstructionArgumentActionTypes.InstructionArgumentDeleted;

  constructor(public payload: string) {}
}

export type InstructionArgumentActions =
  | InstructionArgumentCreated
  | InstructionArgumentUpdated
  | InstructionArgumentDeleted;
