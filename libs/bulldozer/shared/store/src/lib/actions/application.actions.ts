import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { Action, ApplicationActionTypes } from './types';

export class ApplicationCreated implements Action<void> {
  type = ApplicationActionTypes.ApplicationCreated;
}

export class ApplicationUpdated implements Action<Document<Application>> {
  type = ApplicationActionTypes.ApplicationUpdated;

  constructor(public payload: Document<Application>) {}
}

export class ApplicationDeleted implements Action<string> {
  type = ApplicationActionTypes.ApplicationDeleted;

  constructor(public payload: string) {}
}

export type ApplicationActions =
  | ApplicationCreated
  | ApplicationUpdated
  | ApplicationDeleted;
