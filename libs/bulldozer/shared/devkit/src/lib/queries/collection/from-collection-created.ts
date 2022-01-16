import { Observable } from 'rxjs';
import { fromDocumentCreated } from '../../operations';
import { ReactiveConnection } from '../../reactive-connection';
import {
  Collection,
  CollectionFilters,
  COLLECTION_ACCOUNT_NAME,
  Document,
} from '../../utils';
import { createCollectionDocument } from './utils';

export const fromCollectionCreated = (
  connection: ReactiveConnection,
  filters: CollectionFilters
): Observable<Document<Collection>> =>
  fromDocumentCreated(
    connection,
    filters,
    COLLECTION_ACCOUNT_NAME,
    createCollectionDocument
  );
