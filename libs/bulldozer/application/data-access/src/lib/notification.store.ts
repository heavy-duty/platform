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
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { ComponentStore } from '@ngrx/component-store';
import { ProgramError } from '@project-serum/anchor';
import { WalletError } from '@solana/wallet-adapter-base';
import { merge, tap } from 'rxjs';

interface ViewModel {
  error?: string;
  event?: string;
}

@Injectable()
export class NotificationStore extends ComponentStore<ViewModel> {
  readonly error$ = this.select(({ error }) => error);
  readonly event$ = this.select(({ event }) => event);

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

  readonly clearError = this.updater((state) => ({
    ...state,
    error: undefined,
  }));

  readonly clearEvent = this.updater((state) => ({
    ...state,
    event: undefined,
  }));

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
      isNotNullOrUndefined,
      tap((error) => this.patchState({ error: this.getErrorMessage(error) }))
    )
  );

  readonly notifySuccess = this.effect(() =>
    merge(
      this._workspaceStore.event$,
      this._applicationStore.event$,
      this._collectionStore.event$,
      this._collectionAttributeStore.event$,
      this._instructionStore.event$,
      this._instructionAccountStore.event$,
      this._instructionArgumentStore.event$,
      this._instructionRelationStore.event$
    ).pipe(
      isNotNullOrUndefined,
      tap((event) => this.patchState({ event: event.type }))
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
      console.log(error);
      return 'Unknown error';
    }
  }
}
