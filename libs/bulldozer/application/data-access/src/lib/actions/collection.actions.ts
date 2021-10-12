import { Action, CollectionActionTypes } from './types';

export class CollectionInit implements Action<void> {
  type = CollectionActionTypes.CollectionInit;
}

export class CollectionCreated implements Action<void> {
  type = CollectionActionTypes.CollectionCreated;
}

export class CollectionUpdated implements Action<string> {
  type = CollectionActionTypes.CollectionUpdated;

  constructor(public payload: string) {}
}

export class CollectionDeleted implements Action<string> {
  type = CollectionActionTypes.CollectionDeleted;

  constructor(public payload: string) {}
}

export class CollectionAttributeCreated implements Action<void> {
  type = CollectionActionTypes.CollectionAttributeCreated;
}

export class CollectionAttributeUpdated implements Action<string> {
  type = CollectionActionTypes.CollectionAttributeUpdated;

  constructor(public payload: string) {}
}

export class CollectionAttributeDeleted implements Action<string> {
  type = CollectionActionTypes.CollectionAttributeDeleted;

  constructor(public payload: string) {}
}

export type CollectionActions =
  | CollectionInit
  | CollectionCreated
  | CollectionUpdated
  | CollectionDeleted
  | CollectionAttributeCreated
  | CollectionAttributeUpdated
  | CollectionAttributeDeleted;
