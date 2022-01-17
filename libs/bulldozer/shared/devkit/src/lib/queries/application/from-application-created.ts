import { ReactiveConnection } from '@heavy-duty/rx-solana';
import { Observable } from 'rxjs';
import {
  Application,
  ApplicationFilters,
  APPLICATION_ACCOUNT_NAME,
  createApplicationDocument,
  Document,
  fromAccountCreated,
} from '../../utils';

export const fromApplicationCreated = (
  connection: ReactiveConnection,
  filters: ApplicationFilters
): Observable<Document<Application>> =>
  fromAccountCreated(
    connection,
    filters,
    APPLICATION_ACCOUNT_NAME,
    createApplicationDocument
  );
