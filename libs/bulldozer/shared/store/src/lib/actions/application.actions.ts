import {
  Action,
  APPLICATION_CREATED,
  APPLICATION_DELETED,
  APPLICATION_UPDATED,
} from './types';

export class ApplicationCreated implements Action<void> {
  type: typeof APPLICATION_CREATED = APPLICATION_CREATED;
}

export class ApplicationUpdated implements Action<string> {
  type: typeof APPLICATION_UPDATED = APPLICATION_UPDATED;

  constructor(public payload: string) {}
}

export class ApplicationDeleted implements Action<string> {
  type: typeof APPLICATION_DELETED = APPLICATION_DELETED;

  constructor(public payload: string) {}
}

export type ApplicationActions =
  | ApplicationCreated
  | ApplicationUpdated
  | ApplicationDeleted;
