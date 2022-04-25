import {
  CollaboratorDto,
  InstructionStatus,
} from '@heavy-duty/bulldozer-devkit';
import { Map } from 'immutable';
import { CollaboratorItemView } from './types';

const decodeCollaboratorStatus = (id: number): { id: number; name: string } => {
  switch (id) {
    case 0:
      return {
        id,
        name: 'pending',
      };
    case 1:
      return {
        id,
        name: 'approved',
      };
    case 2:
      return {
        id,
        name: 'rejected',
      };
    default:
      throw Error('Invalid kind id');
  }
};

export const reduceInstructions = (
  items: Map<string, CollaboratorItemView>,
  instruction: InstructionStatus
): Map<string, CollaboratorItemView> => {
  switch (instruction.name) {
    case 'createCollaborator':
    case 'requestCollaboratorStatus': {
      const workspaceId = instruction.accounts.find(
        (account) => account.name === 'Workspace'
      )?.pubkey;
      const collaboratorId = instruction.accounts.find(
        (account) => account.name === 'Collaborator'
      )?.pubkey;
      const userId = instruction.accounts.find(
        (account) => account.name === 'User'
      )?.pubkey;
      const authority = instruction.accounts.find(
        (account) => account.name === 'Authority'
      )?.pubkey;

      if (
        workspaceId === undefined ||
        collaboratorId === undefined ||
        userId === undefined ||
        authority === undefined
      ) {
        throw new Error(`Malformed ${instruction.name}`);
      }

      return items.set(collaboratorId, {
        id: collaboratorId,
        isCreating: instruction.transactionStatus.status !== 'finalized',
        isUpdating: false,
        isDeleting: false,
        authority,
        isAdmin: false,
        userId,
        workspaceId,
        status: decodeCollaboratorStatus(
          instruction.name === 'createCollaborator' ? 1 : 0
        ),
        createdAt: Date.now(),
      });
    }
    case 'updateCollaborator': {
      const collaboratorId = instruction.accounts.find(
        (account) => account.name === 'Collaborator'
      )?.pubkey;

      if (collaboratorId === undefined) {
        throw new Error(`Malformed ${instruction.name}`);
      }

      const item = items.get(collaboratorId);

      if (item === undefined) {
        return items;
      }

      const data = instruction.data as {
        arguments: CollaboratorDto;
      };
      const status = decodeCollaboratorStatus(data.arguments.status);

      return items.set(collaboratorId, {
        ...item,
        status,
        isUpdating: instruction.transactionStatus.status !== 'finalized',
      });
    }
    case 'retryCollaboratorStatus': {
      const collaboratorId = instruction.accounts.find(
        (account) => account.name === 'Collaborator'
      )?.pubkey;

      if (collaboratorId === undefined) {
        throw new Error(`Malformed ${instruction.name}`);
      }

      const item = items.get(collaboratorId);

      if (item === undefined) {
        return items;
      }

      return items.set(collaboratorId, {
        ...item,
        status: decodeCollaboratorStatus(0),
        isUpdating: instruction.transactionStatus.status !== 'finalized',
      });
    }
    case 'deleteCollaborator': {
      const collaboratorId = instruction.accounts.find(
        (account) => account.name === 'Collaborator'
      )?.pubkey;

      if (collaboratorId === undefined) {
        throw new Error(`Malformed ${instruction.name}`);
      }

      if (instruction.transactionStatus.status === 'finalized') {
        return items.delete(collaboratorId);
      }

      const item = items.get(collaboratorId);

      if (item === undefined) {
        return items;
      }

      return items.set(collaboratorId, {
        ...item,
        isDeleting: true,
      });
    }
    default:
      return items;
  }
};
