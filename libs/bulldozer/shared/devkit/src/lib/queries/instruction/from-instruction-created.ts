import { Observable } from 'rxjs';
import { fromDocumentCreated } from '../../operations';
import { ReactiveConnection } from '../../reactive-connection';
import {
  Document,
  Instruction,
  InstructionFilters,
  INSTRUCTION_ACCOUNT_NAME,
} from '../../utils';
import { createInstructionDocument } from './utils';

export const fromInstructionCreated = (
  connection: ReactiveConnection,
  filters: InstructionFilters
): Observable<Document<Instruction>> =>
  fromDocumentCreated(
    connection,
    filters,
    INSTRUCTION_ACCOUNT_NAME,
    createInstructionDocument
  );
