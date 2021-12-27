import {
  Application,
  Instruction,
  InstructionArgument,
} from '@heavy-duty/bulldozer/application/utils/types';
import { formatInstructionArguments, formatName } from '.';

export const formatApplication = (
  application: Application,
  instructions: Instruction[],
  instructionArguments: InstructionArgument[]
) => {
  return {
    id: application.id,
    name: formatName(application.data.name),
    instructions: instructions.map((instruction) => ({
      ...instruction,
      data: {
        ...instruction.data,
        name: formatName(instruction.data.name),
      },
      arguments: formatInstructionArguments(
        instruction.id,
        instructionArguments
      ),
    })),
  };
};
