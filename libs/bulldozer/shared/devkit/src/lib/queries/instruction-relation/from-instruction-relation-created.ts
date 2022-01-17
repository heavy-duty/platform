import { ReactiveConnection } from '@heavy-duty/rx-solana';
import { Observable } from 'rxjs';
import {
  createInstructionRelationRelation,
  fromAccountCreated,
  InstructionRelation,
  InstructionRelationFilters,
  INSTRUCTION_RELATION_ACCOUNT_NAME,
  Relation,
} from '../../utils';

export const fromInstructionRelationCreated = (
  connection: ReactiveConnection,
  filters: InstructionRelationFilters
): Observable<Relation<InstructionRelation>> =>
  fromAccountCreated(
    connection,
    filters,
    INSTRUCTION_RELATION_ACCOUNT_NAME,
    createInstructionRelationRelation
  );
