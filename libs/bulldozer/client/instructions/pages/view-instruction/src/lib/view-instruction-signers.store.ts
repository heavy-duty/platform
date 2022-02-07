import { Injectable } from '@angular/core';
import { Document, InstructionAccount } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest, tap } from 'rxjs';
import { ViewInstructionAccountsStore } from './view-instruction-accounts.store';
import { ViewInstructionStore } from './view-instruction.store';

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
    private readonly _viewInstructionStore: ViewInstructionStore,
    private readonly _viewInstructionAccountsStore: ViewInstructionAccountsStore
  ) {
    super(initialState);
  }

  protected readonly _loadSigners = this.effect(() =>
    combineLatest({
      instruction: this._viewInstructionStore.instruction$,
      instructionAccounts:
        this._viewInstructionAccountsStore.instructionAccounts$,
    }).pipe(
      tap(({ instruction, instructionAccounts }) =>
        this.patchState({
          instructionSigners: instruction
            ? instructionAccounts.filter(
                ({ data }) =>
                  data.instruction === instruction.id && data.kind.id === 1
              )
            : [],
        })
      )
    )
  );
}
