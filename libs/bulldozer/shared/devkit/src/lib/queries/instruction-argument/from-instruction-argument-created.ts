import { ReactiveConnection } from '@heavy-duty/rx-solana';
import { Observable } from 'rxjs';
import {
  createInstructionArgumentDocument,
  Document,
  fromAccountCreated,
  InstructionArgument,
  InstructionArgumentFilters,
  INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
} from '../../utils';

export const fromInstructionArgumentCreated = (
  connection: ReactiveConnection,
  filters: InstructionArgumentFilters
): Observable<Document<InstructionArgument>> =>
  fromAccountCreated(
    connection,
    filters,
    INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
    createInstructionArgumentDocument
  );
