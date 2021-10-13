import {
  Application,
  InstructionExtended,
} from '@heavy-duty/bulldozer/application/utils/types';
import { formatInstructionArguments, formatName } from '.';

export const formatApplication = (
  application: Application,
  instructions: InstructionExtended[]
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
        instruction.arguments
      ),
    })),
  };
};
