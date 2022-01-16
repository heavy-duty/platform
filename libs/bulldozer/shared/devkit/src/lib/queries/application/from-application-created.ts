import { Observable } from 'rxjs';
import { fromDocumentCreated } from '../../operations';
import { ReactiveConnection } from '../../reactive-connection';
import {
  Application,
  ApplicationFilters,
  APPLICATION_ACCOUNT_NAME,
  Document,
} from '../../utils';
import { createApplicationDocument } from './utils';

export const fromApplicationCreated = (
  connection: ReactiveConnection,
  filters: ApplicationFilters
): Observable<Document<Application>> =>
  fromDocumentCreated(
    connection,
    filters,
    APPLICATION_ACCOUNT_NAME,
    createApplicationDocument
  );
