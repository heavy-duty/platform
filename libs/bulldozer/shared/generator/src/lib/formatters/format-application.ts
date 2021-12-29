import {
  Application,
  Document,
  Instruction,
  InstructionArgument,
} from '@heavy-duty/bulldozer-devkit';
import { formatInstructionArguments, formatName } from '.';

export const formatApplication = (
  application: Document<Application>,
  instructions: Document<Instruction>[],
  instructionArguments: Document<InstructionArgument>[]
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
