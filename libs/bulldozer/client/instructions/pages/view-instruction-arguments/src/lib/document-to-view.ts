import { Document, InstructionArgument } from '@heavy-duty/bulldozer-devkit';
import { InstructionArgumentItemView } from './types';

export const documentToView = (
  document: Document<InstructionArgument>
): InstructionArgumentItemView => {
  return {
    id: document.id,
    name: document.name,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    kind: document.data.kind,
    modifier: document.data.modifier,
    instructionId: document.data.instruction,
    applicationId: document.data.application,
    workspaceId: document.data.workspace,
  };
};
