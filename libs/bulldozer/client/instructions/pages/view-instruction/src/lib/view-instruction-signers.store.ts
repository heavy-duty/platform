import { Injectable } from '@angular/core';
import {
  InstructionAccountsStore,
  InstructionStore,
} from '@bulldozer-client/instructions-data-access';
import {
  Document,
  Instruction,
  InstructionAccount,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore } from '@ngrx/component-store';

interface ViewModel {
  instructionSigners: Document<InstructionAccount>[];
}

const initialState: ViewModel = {
  instructionSigners: [],
};

@Injectable()
export class ViewInstructionSignersStore extends ComponentStore<ViewModel> {
  readonly instructionSigners$ = this.select(
    ({ instructionSigners }) => instructionSigners
  );

  constructor(
    instructionStore: InstructionStore,
    instructionAccountsStore: InstructionAccountsStore
  ) {
    super(initialState);

    this._loadSigners(
      this.select(
        instructionStore.instruction$,
        instructionAccountsStore.instructionAccounts$,
        (instruction, instructionAccounts) => ({
          instruction,
          instructionAccounts,
        }),
        { debounce: true }
      )
    );
  }

  private readonly _loadSigners = this.updater<{
    instruction: Document<Instruction> | null;
    instructionAccounts: Document<InstructionAccount>[];
  }>((state, { instruction, instructionAccounts }) => ({
    ...state,
    instructionSigners: instruction
      ? instructionAccounts.filter(
          ({ data }) =>
            data.instruction === instruction.id && data.kind.id === 1
        )
      : [],
  }));
}
