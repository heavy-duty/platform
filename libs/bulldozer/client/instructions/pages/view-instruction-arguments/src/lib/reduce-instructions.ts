import { InstructionStatus } from '@heavy-duty/broadcaster';
import { InstructionArgumentDto } from '@heavy-duty/bulldozer-devkit';
import { InstructionArgumentItemView } from './types';

const decodeAttributeKind = (
  id: number,
  size: number
): { id: number; name: string; size: number } => {
  switch (id) {
    case 0:
      return {
        id,
        name: 'boolean',
        size,
      };
    case 1:
      return {
        id,
        name: 'number',
        size,
      };
    case 2:
      return {
        id,
        name: 'string',
        size,
      };
    case 3:
      return {
        id,
        name: 'pubkey',
        size,
      };
    default:
      throw Error('Invalid kind id');
  }
};

const decodeAttributeModifier = (
  id: number,
  size: number
): { id: number; name: string; size: number } => {
  switch (id) {
    case 0:
      return {
        id,
        name: 'array',
        size,
      };
    case 1:
      return {
        id,
        name: 'vector',
        size,
      };
    default:
      throw Error('Invalid kind id');
  }
};

const getAttributeKindSize = (
  kind: number,
  extensions: { max: number | null; maxLength: number | null }
): number => {
  switch (kind) {
    case 0:
      return 1;
    case 1:
      if (extensions.max === null) {
        throw Error('Max is required for numbers');
      }
      return extensions.max;
    case 2:
      if (extensions.maxLength === null) {
        throw Error('Max length is required for strings');
      }
      return extensions.maxLength;
    case 3:
      return 32;
    default:
      throw Error('Invalid Attribute Kind');
  }
};

export const reduceInstructions = (
  items: InstructionArgumentItemView[],
  instruction: InstructionStatus
): InstructionArgumentItemView[] => {
  switch (instruction.name) {
    case 'createInstructionArgument': {
      if (instruction.transactionStatus.status === 'confirmed') {
        const data = instruction.data as {
          arguments: InstructionArgumentDto;
        };
        const name = data.arguments.name;
        const kind = decodeAttributeKind(
          data.arguments.kind,
          getAttributeKindSize(data.arguments.kind, {
            max: data.arguments.max,
            maxLength: data.arguments.maxLength,
          })
        );
        let modifier: {
          id: number;
          name: string;
          size: number;
        } | null = null;
        if (data.arguments.modifier !== null && data.arguments.size !== null) {
          modifier = decodeAttributeModifier(
            data.arguments.modifier,
            data.arguments.size
          );
        }

        const workspaceId = instruction.accounts.find(
          (account) => account.name === 'Workspace'
        )?.pubkey;
        const applicationId = instruction.accounts.find(
          (account) => account.name === 'Application'
        )?.pubkey;
        const instructionId = instruction.accounts.find(
          (account) => account.name === 'Instruction'
        )?.pubkey;
        const argumentId = instruction.accounts.find(
          (account) => account.name === 'Argument'
        )?.pubkey;

        if (
          workspaceId === undefined ||
          applicationId === undefined ||
          instructionId === undefined ||
          argumentId === undefined
        ) {
          throw new Error('Malformed Create Instruction Argument');
        }

        const itemIndex = items.findIndex((item) => item.id === argumentId);

        if (itemIndex === -1) {
          return [
            ...items,
            {
              id: argumentId,
              name,
              kind,
              modifier,
              isCreating: true,
              isUpdating: false,
              isDeleting: false,
              instructionId,
              applicationId,
              workspaceId,
            },
          ];
        } else {
          return [
            ...items.slice(0, itemIndex),
            {
              ...items[itemIndex],
              id: argumentId,
              name,
              kind,
              modifier,
              isCreating: true,
              isUpdating: false,
              isDeleting: false,
              instructionId,
              applicationId,
              workspaceId,
            },
            ...items.slice(itemIndex + 1),
          ];
        }
      } else {
        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Argument' && account.pubkey === item.id
            )
          ) {
            return item;
          }

          return {
            ...item,
            isCreating: false,
          };
        });
      }
    }
    case 'updateInstructionArgument': {
      const data = instruction.data as {
        arguments: InstructionArgumentDto;
      };
      const name = data.arguments.name;
      const kind = decodeAttributeKind(
        data.arguments.kind,
        getAttributeKindSize(data.arguments.kind, {
          max: data.arguments.max,
          maxLength: data.arguments.maxLength,
        })
      );
      let modifier: {
        id: number;
        name: string;
        size: number;
      } | null = null;
      if (data.arguments.modifier !== null && data.arguments.size !== null) {
        modifier = decodeAttributeModifier(
          data.arguments.modifier,
          data.arguments.size
        );
      }

      return items.map((item) => {
        if (
          !instruction.accounts.some(
            (account) =>
              account.name === 'Argument' && account.pubkey === item.id
          )
        ) {
          return item;
        }

        return {
          ...item,
          name,
          kind,
          modifier,
          isUpdating: instruction.transactionStatus.status !== 'finalized',
        };
      });
    }
    case 'deleteInstructionArgument':
      if (instruction.transactionStatus.status === 'confirmed') {
        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Argument' && account.pubkey === item.id
            )
          ) {
            return item;
          }

          return {
            ...item,
            isDeleting: true,
          };
        });
      } else {
        return items.filter(
          (item) =>
            !instruction.accounts.some(
              (account) =>
                account.name === 'Argument' && account.pubkey === item.id
            )
        );
      }
    default:
      return items;
  }
};
