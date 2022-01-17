import { ReactiveConnection } from '@heavy-duty/rx-solana';
import { Observable } from 'rxjs';
import {
  COLLECTION_ACCOUNT_NAME,
  createInstructionDocument,
  Document,
  fromAccountCreated,
  Instruction,
  InstructionFilters,
} from '../../utils';

export const fromInstructionCreated = (
  connection: ReactiveConnection,
  filters: InstructionFilters
): Observable<Document<Instruction>> =>
  fromAccountCreated(
    connection,
    filters,
    COLLECTION_ACCOUNT_NAME,
    createInstructionDocument
  );
