import { CollectionAttribute, Document } from '@heavy-duty/bulldozer-devkit';
import { Action, CollectionAttributeActionTypes } from './types';

export class CollectionAttributeCreated implements Action<void> {
  type = CollectionAttributeActionTypes.CollectionAttributeCreated;
}

export class CollectionAttributeUpdated
  implements Action<Document<CollectionAttribute>>
{
  type = CollectionAttributeActionTypes.CollectionAttributeUpdated;

  constructor(public payload: Document<CollectionAttribute>) {}
}

export class CollectionAttributeDeleted implements Action<string> {
  type = CollectionAttributeActionTypes.CollectionAttributeDeleted;

  constructor(public payload: string) {}
}

export type CollectionAttributeActions =
  | CollectionAttributeCreated
  | CollectionAttributeUpdated
  | CollectionAttributeDeleted;
