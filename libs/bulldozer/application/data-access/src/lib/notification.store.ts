import { Injectable } from '@angular/core';
import {
  ApplicationStore,
  CollectionAttributeStore,
  CollectionStore,
  InstructionAccountStore,
  InstructionArgumentStore,
  InstructionRelationStore,
  InstructionStore,
  WorkspaceStore,
} from '@heavy-duty/bulldozer-store';
import { ComponentStore } from '@ngrx/component-store';
import { ProgramError } from '@project-serum/anchor';
import { WalletError } from '@solana/wallet-adapter-base';
import { merge, tap } from 'rxjs';

interface ViewModel {
  error?: string;
}

@Injectable()
export class NotificationStore extends ComponentStore<ViewModel> {
  readonly error$ = this.select(({ error }) => error);

  constructor(
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _collectionAttributeStore: CollectionAttributeStore,
    private readonly _instructionStore: InstructionStore,
    private readonly _instructionAccountStore: InstructionAccountStore,
    private readonly _instructionArgumentStore: InstructionArgumentStore,
    private readonly _instructionRelationStore: InstructionRelationStore
  ) {
    super({});
  }

  readonly notifyErrors = this.effect(() =>
    merge(
      this._workspaceStore.error$,
      this._applicationStore.error$,
      this._collectionStore.error$,
      this._collectionAttributeStore.error$,
      this._instructionStore.error$,
      this._instructionAccountStore.error$,
      this._instructionArgumentStore.error$,
      this._instructionRelationStore.error$
    ).pipe(
      tap((error) => this.patchState({ error: this.getErrorMessage(error) }))
    )
  );

  private getErrorMessage(error: unknown) {
    if (typeof error === 'string') {
      return error;
    } else if (error instanceof WalletError) {
      return error.name;
    } else if (error instanceof ProgramError) {
      return error.message;
    } else {
      return 'Unknown error';
    }
  }
}
