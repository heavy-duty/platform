import { Observable } from 'rxjs';
import { fromDocumentCreated } from '../../operations';
import { ReactiveConnection } from '../../reactive-connection';
import {
  Document,
  InstructionRelation,
  InstructionRelationFilters,
  INSTRUCTION_RELATION_ACCOUNT_NAME,
} from '../../utils';
import { createInstructionRelationDocument } from './utils';

export const fromInstructionRelationCreated = (
  connection: ReactiveConnection,
  filters: InstructionRelationFilters
): Observable<Document<InstructionRelation>> =>
  fromDocumentCreated(
    connection,
    filters,
    INSTRUCTION_RELATION_ACCOUNT_NAME,
    createInstructionRelationDocument
  );
