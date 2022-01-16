import { Observable } from 'rxjs';
import { fromDocumentCreated } from '../../operations';
import { ReactiveConnection } from '../../reactive-connection';
import {
  Document,
  InstructionArgument,
  InstructionArgumentFilters,
  INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
} from '../../utils';
import { createInstructionArgumentDocument } from './utils';

export const fromInstructionArgumentCreated = (
  connection: ReactiveConnection,
  filters: InstructionArgumentFilters
): Observable<Document<InstructionArgument>> =>
  fromDocumentCreated(
    connection,
    filters,
    INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
    createInstructionArgumentDocument
  );
