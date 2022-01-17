import { ReactiveConnection } from '@heavy-duty/rx-solana';
import { Observable } from 'rxjs';
import {
  CollectionAttribute,
  CollectionAttributeFilters,
  COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
  createCollectionAttributeDocument,
  Document,
  fromAccountCreated,
} from '../../utils';

export const fromCollectionAttributeCreated = (
  connection: ReactiveConnection,
  filters: CollectionAttributeFilters
): Observable<Document<CollectionAttribute>> =>
  fromAccountCreated(
    connection,
    filters,
    COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
    createCollectionAttributeDocument
  );
