import { Action, ApplicationActionTypes } from './types';

export class ApplicationInit implements Action<void> {
  type = ApplicationActionTypes.ApplicationInit;
}

export class ApplicationCreated implements Action<void> {
  type = ApplicationActionTypes.ApplicationCreated;
}

export class ApplicationUpdated implements Action<string> {
  type = ApplicationActionTypes.ApplicationUpdated;

  constructor(public payload: string) {}
}

export class ApplicationDeleted implements Action<string> {
  type = ApplicationActionTypes.ApplicationDeleted;

  constructor(public payload: string) {}
}

export type ApplicationActions =
  | ApplicationInit
  | ApplicationCreated
  | ApplicationUpdated
  | ApplicationDeleted;
