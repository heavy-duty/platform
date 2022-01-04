import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
import { Action, InstructionActionTypes } from './types';

export class InstructionInit implements Action<void> {
  type = InstructionActionTypes.InstructionInit;
}

export class InstructionCreated implements Action<void> {
  type = InstructionActionTypes.InstructionCreated;
}

export class InstructionUpdated implements Action<Document<Instruction>> {
  type = InstructionActionTypes.InstructionUpdated;

  constructor(public payload: Document<Instruction>) {}
}

export class InstructionDeleted implements Action<string> {
  type = InstructionActionTypes.InstructionDeleted;

  constructor(public payload: string) {}
}

export class InstructionBodyUpdated implements Action<string> {
  type = InstructionActionTypes.InstructionBodyUpdated;

  constructor(public payload: string) {}
}

export type InstructionActions =
  | InstructionInit
  | InstructionCreated
  | InstructionUpdated
  | InstructionDeleted;
