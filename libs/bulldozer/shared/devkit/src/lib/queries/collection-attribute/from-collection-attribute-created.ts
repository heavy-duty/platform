import { Observable } from 'rxjs';
import { fromDocumentCreated } from '../../operations';
import { ReactiveConnection } from '../../reactive-connection';
import {
  CollectionAttribute,
  CollectionAttributeFilters,
  COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
  Document,
} from '../../utils';
import { createCollectionAttributeDocument } from './utils';

export const fromCollectionAttributeCreated = (
  connection: ReactiveConnection,
  filters: CollectionAttributeFilters
): Observable<Document<CollectionAttribute>> =>
  fromDocumentCreated(
    connection,
    filters,
    COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
    createCollectionAttributeDocument
  );
