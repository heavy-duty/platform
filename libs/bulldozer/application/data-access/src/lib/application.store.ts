import { Injectable } from '@angular/core';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, concatMap, Observable, Subject, tap } from 'rxjs';
import {
  ApplicationActions,
  ApplicationCreated,
  ApplicationDeleted,
  ApplicationInit,
  ApplicationUpdated,
} from './actions/application.actions';
import { WorkspaceStore } from './workspace.store';

interface ViewModel {
  applicationId: string | null;
}

const initialState = {
  applicationId: null,
};

@Injectable()
export class ApplicationStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _events = new BehaviorSubject<ApplicationActions>(
    new ApplicationInit()
  );
  readonly events$ = this._events.asObservable();
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly applications$ = this.select(
    this._workspaceStore.applications$,
    this._workspaceStore.workspaceId$,
    (applications, workspaceId) =>
      applications.filter(({ data }) => data.workspace === workspaceId)
  );
  readonly application$ = this.select(
    this._workspaceStore.applications$,
    this.applicationId$,
    (applications, applicationId) =>
      applications.find(({ id }) => id === applicationId) || null
  );

  constructor(
    private readonly _bulldozerProgramStore: BulldozerProgramStore,
    private readonly _workspaceStore: WorkspaceStore
  ) {
    super(initialState);
  }

  readonly selectApplication = this.effect(
    (applicationId$: Observable<string | null>) =>
      applicationId$.pipe(
        tap((applicationId) => this.patchState({ applicationId }))
      )
  );

  readonly createApplication = this.effect(
    (request$: Observable<{ workspaceId: string; data: { name: string } }>) =>
      request$.pipe(
        concatMap(({ workspaceId, data }) =>
          this._bulldozerProgramStore
            .createApplication(workspaceId, data.name)
            .pipe(
              tapResponse(
                () => this._events.next(new ApplicationCreated()),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly updateApplication = this.effect(
    (
      request$: Observable<{
        application: Document<Application>;
        changes: { name: string };
      }>
    ) =>
      request$.pipe(
        concatMap(({ application, changes }) =>
          this._bulldozerProgramStore
            .updateApplication(application.id, changes.name)
            .pipe(
              tapResponse(
                () => this._events.next(new ApplicationUpdated(application.id)),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly deleteApplication = this.effect(
    (application$: Observable<Document<Application>>) =>
      application$.pipe(
        concatMap((application) => {
          const applicationData = this._workspaceStore.getApplicationData(
            application.id
          );

          return this._bulldozerProgramStore
            .deleteApplication(
              application.id,
              applicationData.collections.map(({ id }) => id),
              applicationData.collectionAttributes.map(({ id }) => id),
              applicationData.instructions.map(({ id }) => id),
              applicationData.instructionArguments.map(({ id }) => id),
              applicationData.instructionAccounts.map(({ id }) => id),
              applicationData.instructionRelations.map(({ id }) => id)
            )
            .pipe(
              tapResponse(
                () => this._events.next(new ApplicationDeleted(application.id)),
                (error) => this._error.next(error)
              )
            );
        })
      )
  );
}
