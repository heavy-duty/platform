import { ReactiveConnection } from '@heavy-duty/rx-solana';
import { Observable } from 'rxjs';
import {
  createInstructionAccountDocument,
  Document,
  fromAccountCreated,
  InstructionAccount,
  InstructionAccountFilters,
  INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
} from '../../utils';

export const fromInstructionAccountCreated = (
  connection: ReactiveConnection,
  filters: InstructionAccountFilters
): Observable<Document<InstructionAccount>> =>
  fromAccountCreated(
    connection,
    filters,
    INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
    createInstructionAccountDocument
  );
