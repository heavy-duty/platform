import {
  Action,
  COLLECTION_CREATED,
  COLLECTION_DELETED,
  COLLECTION_UPDATED,
} from './types';

export class CollectionCreated implements Action<void> {
  type: typeof COLLECTION_CREATED = COLLECTION_CREATED;
}

export class CollectionUpdated implements Action<string> {
  type: typeof COLLECTION_UPDATED = COLLECTION_UPDATED;

  constructor(public payload: string) {}
}

export class CollectionDeleted implements Action<string> {
  type: typeof COLLECTION_DELETED = COLLECTION_DELETED;

  constructor(public payload: string) {}
}

export type CollectionActions =
  | CollectionCreated
  | CollectionUpdated
  | CollectionDeleted;
