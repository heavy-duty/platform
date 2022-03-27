import { Injectable } from '@angular/core';
import {
  InstructionAccountItemView,
  InstructionAccountsStore,
} from '@bulldozer-client/instructions-data-access';
import { ComponentStore } from '@ngrx/component-store';

interface ViewModel {
  instructionSigners: InstructionAccountItemView[];
  instructionId: string | null;
}

const initialState: ViewModel = {
  instructionSigners: [],
  instructionId: null,
};

@Injectable()
export class ViewInstructionSignersStore extends ComponentStore<ViewModel> {
  readonly instructionSigners$ = this.select(
    this._instructionAccountsStore.instructionAccounts$,
    this.select(({ instructionId }) => instructionId),
    (instructionAccounts, instructionId) =>
      instructionAccounts.filter(
        ({ document }) =>
          document.data.instruction === instructionId &&
          document.data.kind.id === 1
      )
  );

  constructor(
    private readonly _instructionAccountsStore: InstructionAccountsStore
  ) {
    super(initialState);
  }

  readonly setInstructionId = this.updater<string | null>(
    (state, instructionId) => ({ ...state, instructionId })
  );
}
