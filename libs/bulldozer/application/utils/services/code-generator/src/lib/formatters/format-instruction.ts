import {
  InstructionAccountExtended,
  InstructionArgument,
  InstructionExtended,
} from '@heavy-duty/bulldozer/application/utils/types';
import { capitalize } from '../utils';
import { formatName } from './format-name';

const getArgumentKindName = (id: number, name: string, size: number) => {
  if (id === 0) {
    if (size <= 256) {
      return 'u8';
    } else if (size > 256 && size <= 65536) {
      return 'u16';
    } else if (size > 65536 && size <= 4294967296) {
      return 'u32';
    } else {
      throw Error('Invalid max');
    }
  } else if (id === 1 || id === 2) {
    return capitalize(name);
  } else {
    throw Error('Invalid kind');
  }
};

export const formatInstructionArguments = (
  instructionId: string,
  instructionArguments: InstructionArgument[]
) =>
  instructionArguments
    .filter((argument) => argument.data.instruction === instructionId)
    .map((argument) => ({
      id: argument.id,
      data: {
        ...argument.data,
        name: formatName(argument.data.name),
        kind: {
          ...argument.data.kind,
          name: getArgumentKindName(
            argument.data.kind.id,
            argument.data.kind.name,
            argument.data.kind.size
          ),
        },
      },
    }));

const formatInstructionAccounts = (
  instructionId: string,
  instructionAccounts: InstructionAccountExtended[]
) =>
  instructionAccounts
    .filter((account) => account.data.instruction === instructionId)
    .map((account) => {
      let payer = null,
        collection = null,
        close = null,
        relations = null;

      if (account.data.relations) {
        relations = account.data.relations.map((relation) => ({
          ...relation,
          data: {
            ...relation.data,
            to: {
              ...relation.data.to,
              data: {
                ...relation.data.to.data,
                name: formatName(relation.data.to.data.name),
              },
            },
          },
        }));
      }

      if (account.data.payer) {
        payer = {
          ...account.data.payer,
          data: {
            ...account.data.payer?.data,
            name: formatName(account.data.payer?.data?.name),
          },
        };
      }

      if (account.data.collection) {
        collection = {
          ...account.data.collection,
          data: {
            ...account.data.collection?.data,
            name: formatName(account.data.collection?.data?.name),
          },
        };
      }

      if (account.data.close) {
        close = {
          ...account.data.close,
          data: {
            ...account.data.close?.data,
            name: formatName(account.data.close?.data?.name),
          },
        };
      }

      return {
        id: account.id,
        data: {
          ...account.data,
          collection: collection,
          close,
          payer: payer,
          name: formatName(account.data.name),
          relations,
        },
      };
    });

export const formatInstruction = (instruction: InstructionExtended) => ({
  name: formatName(instruction.data.name),
  handler: instruction.data.body.split('\n'),
  initializesAccount: instruction.accounts.some(
    (account) => account.data.modifier?.id === 0
  ),
  arguments: formatInstructionArguments(instruction.id, instruction.arguments),
  accounts: formatInstructionAccounts(instruction.id, instruction.accounts),
});
