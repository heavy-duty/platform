import { Document, InstructionAccount } from '@heavy-duty/bulldozer-devkit';
import { Action, InstructionAccountActionTypes } from './types';

export class InstructionAccountCreated implements Action<void> {
  type = InstructionAccountActionTypes.InstructionAccountCreated;
}

export class InstructionAccountUpdated
  implements Action<Document<InstructionAccount>>
{
  type = InstructionAccountActionTypes.InstructionAccountUpdated;

  constructor(public payload: Document<InstructionAccount>) {}
}

export class InstructionAccountDeleted implements Action<string> {
  type = InstructionAccountActionTypes.InstructionAccountDeleted;

  constructor(public payload: string) {}
}

export type InstructionAccountActions =
  | InstructionAccountCreated
  | InstructionAccountUpdated
  | InstructionAccountDeleted;
