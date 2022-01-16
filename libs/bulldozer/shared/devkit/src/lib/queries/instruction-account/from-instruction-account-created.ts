import { Observable } from 'rxjs';
import { fromDocumentCreated } from '../../operations';
import { ReactiveConnection } from '../../reactive-connection';
import {
  Document,
  InstructionAccount,
  InstructionAccountFilters,
  INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
} from '../../utils';
import { createInstructionAccountDocument } from './utils';

export const fromInstructionAccountCreated = (
  connection: ReactiveConnection,
  filters: InstructionAccountFilters
): Observable<Document<InstructionAccount>> =>
  fromDocumentCreated(
    connection,
    filters,
    INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
    createInstructionAccountDocument
  );
