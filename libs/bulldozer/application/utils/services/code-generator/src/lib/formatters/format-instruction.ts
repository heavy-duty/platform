import {
  InstructionAccountExtended,
  InstructionArgument,
  InstructionExtended,
} from '@heavy-duty/bulldozer/application/utils/types';
import { capitalize } from '../utils';
import { formatName } from './format-name';

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
          name:
            argument.data.kind.id === 5
              ? capitalize(argument.data.kind.name)
              : argument.data.kind.name,
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
        modifier = null,
        close = null;
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

      if (account.data.modifier.name !== 'none') {
        modifier = account.data.modifier;
      }

      return {
        id: account.id,
        data: {
          ...account.data,
          collection: collection,
          modifier: modifier,
          close,
          payer: payer,
          name: formatName(account.data.name),
        },
      };
    });

export const formatInstruction = (instruction: InstructionExtended) => ({
  name: formatName(instruction.data.name),
  handler: instruction.data.body.split('\n'),
  arguments: formatInstructionArguments(instruction.id, instruction.arguments),
  accounts: formatInstructionAccounts(instruction.id, instruction.accounts),
});
