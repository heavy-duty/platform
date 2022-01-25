import {
  Action,
  COLLECTION_ATTRIBUTE_CREATED,
  COLLECTION_ATTRIBUTE_DELETED,
  COLLECTION_ATTRIBUTE_UPDATED,
} from './types';

export class CollectionAttributeCreated implements Action<void> {
  type: typeof COLLECTION_ATTRIBUTE_CREATED = COLLECTION_ATTRIBUTE_CREATED;
}

export class CollectionAttributeUpdated implements Action<string> {
  type: typeof COLLECTION_ATTRIBUTE_UPDATED = COLLECTION_ATTRIBUTE_UPDATED;

  constructor(public payload: string) {}
}

export class CollectionAttributeDeleted implements Action<string> {
  type: typeof COLLECTION_ATTRIBUTE_DELETED = COLLECTION_ATTRIBUTE_DELETED;

  constructor(public payload: string) {}
}

export type CollectionAttributeActions =
  | CollectionAttributeCreated
  | CollectionAttributeUpdated
  | CollectionAttributeDeleted;
