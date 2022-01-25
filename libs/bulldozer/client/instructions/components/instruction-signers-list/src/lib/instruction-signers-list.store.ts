import { Injectable } from '@angular/core';
import { InstructionAccountStore } from '@heavy-duty/bulldozer-store';
import { ComponentStore } from '@ngrx/component-store';

interface ViewModel {
  instructionId?: string;
}

const initialState = {};

@Injectable()
export class InstructionSignersListStore extends ComponentStore<ViewModel> {
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);
  readonly instructionAccounts$ = this.select(
    this.instructionId$,
    this._instructionAccountStore.instructionAccounts$,
    (instructionId, instructionAccounts) =>
      instructionId
        ? instructionAccounts.filter(
            (instructionAccount) =>
              instructionAccount.data.instruction === instructionId
          )
        : []
  );
  readonly instructionSigners$ = this.select(
    this.instructionAccounts$,
    (instructionAccounts) =>
      instructionAccounts.filter(({ data }) => data.kind.id === 1)
  );

  constructor(
    private readonly _instructionAccountStore: InstructionAccountStore
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
