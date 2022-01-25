import { Injectable } from '@angular/core';
import { InstructionStore } from '@heavy-duty/bulldozer-store';
import { ComponentStore } from '@ngrx/component-store';

interface ViewModel {
  applicationId?: string;
}

const initialState = {};

@Injectable()
export class InstructionExplorerStore extends ComponentStore<ViewModel> {
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly instructions$ = this.select(
    this._instructionStore.instructions$,
    this.applicationId$,
    (instructions, applicationId) =>
      instructions.filter(
        (instruction) => instruction.data.application === applicationId
      )
  );

  constructor(private readonly _instructionStore: InstructionStore) {
    super(initialState);
  }

  readonly setApplicationId = this.updater(
    (state, applicationId: string | undefined) => ({
      ...state,
      applicationId,
    })
  );
}
