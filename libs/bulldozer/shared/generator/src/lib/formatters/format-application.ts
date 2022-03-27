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
    name: formatName(application.name),
    instructions: instructions.map((instruction) => ({
      ...instruction,
      name: formatName(instruction.name),
      arguments: formatInstructionArguments(
        instruction.id,
        instructionArguments
      ),
    })),
  };
};
