import { ReactiveConnection } from '@heavy-duty/rx-solana';
import { Observable } from 'rxjs';
import {
  Collection,
  CollectionFilters,
  COLLECTION_ACCOUNT_NAME,
  createCollectionDocument,
  Document,
  fromAccountCreated,
} from '../../utils';

export const fromCollectionCreated = (
  connection: ReactiveConnection,
  filters: CollectionFilters
): Observable<Document<Collection>> =>
  fromAccountCreated(
    connection,
    filters,
    COLLECTION_ACCOUNT_NAME,
    createCollectionDocument
  );
