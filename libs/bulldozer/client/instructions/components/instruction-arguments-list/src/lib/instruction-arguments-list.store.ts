import { Injectable } from '@angular/core';
import { InstructionArgumentStore } from '@heavy-duty/bulldozer-store';
import { ComponentStore } from '@ngrx/component-store';

interface ViewModel {
  instructionId?: string;
}

const initialState = {};

@Injectable()
export class InstructionArgumentsListStore extends ComponentStore<ViewModel> {
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);
  readonly instructionArguments$ = this.select(
    this._instructionArgumentStore.instructionArguments$,
    this.instructionId$,
    (instructionArguments, instructionId) =>
      instructionArguments.filter(
        (instructionArgument) =>
          instructionArgument.data.instruction === instructionId
      )
  );

  constructor(
    private readonly _instructionArgumentStore: InstructionArgumentStore
  ) {
    super(initialState);
  }

  readonly setInstructionId = this.updater(
    (state, instructionId: string | undefined) => ({
      ...state,
      instructionId,
    })
  );
}
