import { Injectable } from '@angular/core';
import {
  Document,
  InstructionArgument,
  InstructionArgumentDto,
} from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import {
  InstructionActions,
  InstructionArgumentCreated,
  InstructionArgumentDeleted,
  InstructionArgumentUpdated,
  InstructionInit,
} from './actions/instruction.actions';

@Injectable()
export class InstructionArgumentStore extends ComponentStore<object> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _events = new BehaviorSubject<InstructionActions>(
    new InstructionInit()
  );
  readonly events$ = this._events.asObservable();

  constructor(private readonly _bulldozerProgramStore: BulldozerProgramStore) {
    super({});
  }

  readonly createInstructionArgument = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        instructionId: string;
        data: InstructionArgumentDto;
      }>
    ) =>
      request$.pipe(
        concatMap(({ workspaceId, applicationId, instructionId, data }) =>
          this._bulldozerProgramStore
            .createInstructionArgument(
              workspaceId,
              applicationId,
              instructionId,
              data
            )
            .pipe(
              tapResponse(
                () => this._events.next(new InstructionArgumentCreated()),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly updateInstructionArgument = this.effect(
    (
      request$: Observable<{
        instructionArgument: Document<InstructionArgument>;
        changes: InstructionArgumentDto;
      }>
    ) =>
      request$.pipe(
        concatMap(({ instructionArgument, changes }) =>
          this._bulldozerProgramStore
            .updateInstructionArgument(instructionArgument.id, changes)
            .pipe(
              tapResponse(
                () =>
                  this._events.next(
                    new InstructionArgumentUpdated(instructionArgument.id)
                  ),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly deleteInstructionArgument = this.effect(
    (argumentId$: Observable<string>) =>
      argumentId$.pipe(
        concatMap((argumentId) =>
          this._bulldozerProgramStore
            .deleteInstructionArgument(argumentId)
            .pipe(
              tapResponse(
                () =>
                  this._events.next(new InstructionArgumentDeleted(argumentId)),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );
}
