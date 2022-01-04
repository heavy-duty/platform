import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { Action, CollectionActionTypes } from './types';

export class CollectionCreated implements Action<void> {
  type = CollectionActionTypes.CollectionCreated;
}

export class CollectionUpdated implements Action<Document<Collection>> {
  type = CollectionActionTypes.CollectionUpdated;

  constructor(public payload: Document<Collection>) {}
}

export class CollectionDeleted implements Action<string> {
  type = CollectionActionTypes.CollectionDeleted;

  constructor(public payload: string) {}
}

export type CollectionActions =
  | CollectionCreated
  | CollectionUpdated
  | CollectionDeleted;
