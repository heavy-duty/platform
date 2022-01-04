import { ApplicationActions } from './application.actions';
import { CollectionAttributeActions } from './collection-attribute.actions';
import { CollectionActions } from './collection.actions';
import { InstructionAccountActions } from './instruction-account.actions';
import { InstructionArgumentActions } from './instruction-argument.actions';
import { InstructionRelationActions } from './instruction-relation.actions';
import { InstructionActions } from './instruction.actions';
import { WorkspaceActions } from './workspace.actions';

export type BulldozerActions =
  | ApplicationActions
  | CollectionActions
  | CollectionAttributeActions
  | InstructionAccountActions
  | InstructionArgumentActions
  | InstructionRelationActions
  | InstructionActions
  | WorkspaceActions;
