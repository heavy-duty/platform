import { Injectable } from '@angular/core';
import {
  Document,
  InstructionAccount,
  InstructionAccountDto,
} from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { concatMap, switchMap, tap } from 'rxjs/operators';
import {
  InstructionAccountCreated,
  InstructionAccountDeleted,
  InstructionAccountUpdated,
  InstructionActions,
  InstructionInit,
} from './actions/instruction.actions';

interface ViewModel {
  instructionAccountsMap: Map<string, Document<InstructionAccount>>;
}

const initialState: ViewModel = {
  instructionAccountsMap: new Map<string, Document<InstructionAccount>>(),
};

@Injectable()
export class InstructionAccountStore extends ComponentStore<ViewModel> {
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _events = new BehaviorSubject<InstructionActions>(
    new InstructionInit()
  );
  readonly events$ = this._events.asObservable();
  readonly instructionAccountsMap$ = this.select(
    ({ instructionAccountsMap }) => instructionAccountsMap
  );
  readonly instructionAccounts$ = this.select(
    this.instructionAccountsMap$,
    (instructionAccountsMap) =>
      Array.from(
        instructionAccountsMap,
        ([, instructionAccount]) => instructionAccount
      )
  );

  constructor(private readonly _bulldozerProgramStore: BulldozerProgramStore) {
    super(initialState);
  }

  private readonly _setInstructionAccount = this.updater(
    (state, newInstructionAccount: Document<InstructionAccount>) => {
      const instructionAccountsMap = new Map(state.instructionAccountsMap);
      instructionAccountsMap.set(
        newInstructionAccount.id,
        newInstructionAccount
      );
      return {
        ...state,
        instructionAccountsMap,
      };
    }
  );

  private readonly _addInstructionAccount = this.updater(
    (state, newInstructionAccount: Document<InstructionAccount>) => {
      if (state.instructionAccountsMap.has(newInstructionAccount.id)) {
        return state;
      }
      const instructionAccountsMap = new Map(state.instructionAccountsMap);
      instructionAccountsMap.set(
        newInstructionAccount.id,
        newInstructionAccount
      );
      return {
        ...state,
        instructionAccountsMap,
      };
    }
  );

  private readonly _removeInstructionAccount = this.updater(
    (state, instructionAccountId: string) => {
      const instructionAccountsMap = new Map(state.instructionAccountsMap);
      instructionAccountsMap.delete(instructionAccountId);
      return {
        ...state,
        instructionAccountsMap,
      };
    }
  );

  private readonly _watchInstructionAccounts = this.effect(
    (instructionAccounts$: Observable<Document<InstructionAccount>[]>) =>
      instructionAccounts$.pipe(
        switchMap((instructionAccounts) =>
          merge(
            ...instructionAccounts.map((instructionAccount) =>
              this._bulldozerProgramStore
                .onInstructionAccountUpdated(instructionAccount.id)
                .pipe(
                  tap((changes) => {
                    if (!changes) {
                      this._removeInstructionAccount(instructionAccount.id);
                    } else {
                      this._setInstructionAccount(changes);
                    }
                  })
                )
            )
          )
        )
      )
  );

  private readonly _onInstructionAccountByInstructionChanges = this.effect(
    (instructionId$: Observable<string>) =>
      instructionId$.pipe(
        switchMap((instructionId) =>
          this._bulldozerProgramStore
            .onInstructionAccountByInstructionChanges(instructionId)
            .pipe(
              tap((instructionAccount) =>
                this._addInstructionAccount(instructionAccount)
              )
            )
        )
      )
  );

  readonly loadInstructionAccounts = this.effect(
    (instructionId$: Observable<string>) =>
      instructionId$.pipe(
        concatMap((instructionId) =>
          this._bulldozerProgramStore
            .getInstructionAccountsByInstruction(instructionId)
            .pipe(
              tapResponse(
                (instructionAccounts) => {
                  this.patchState({
                    instructionAccountsMap: instructionAccounts.reduce(
                      (instructionAccountsMap, instructionAccount) =>
                        instructionAccountsMap.set(
                          instructionAccount.id,
                          instructionAccount
                        ),
                      new Map<string, Document<InstructionAccount>>()
                    ),
                  });
                  this._watchInstructionAccounts(instructionAccounts);
                  this._onInstructionAccountByInstructionChanges(instructionId);
                },
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly createInstructionAccount = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        instructionId: string;
        data: InstructionAccountDto;
      }>
    ) =>
      request$.pipe(
        concatMap(({ workspaceId, applicationId, instructionId, data }) =>
          this._bulldozerProgramStore
            .createInstructionAccount(
              workspaceId,
              applicationId,
              instructionId,
              data
            )
            .pipe(
              tapResponse(
                () => this._events.next(new InstructionAccountCreated()),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly updateInstructionAccount = this.effect(
    (
      request$: Observable<{
        instructionAccount: Document<InstructionAccount>;
        changes: InstructionAccountDto;
      }>
    ) =>
      request$.pipe(
        concatMap(({ instructionAccount, changes }) =>
          this._bulldozerProgramStore
            .updateInstructionAccount(instructionAccount.id, changes)
            .pipe(
              tapResponse(
                () =>
                  this._events.next(
                    new InstructionAccountUpdated(instructionAccount.id)
                  ),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly deleteInstructionAccount = this.effect(
    (argumentId$: Observable<string>) =>
      argumentId$.pipe(
        concatMap((argumentId) =>
          this._bulldozerProgramStore.deleteInstructionAccount(argumentId).pipe(
            tapResponse(
              () =>
                this._events.next(new InstructionAccountDeleted(argumentId)),
              (error) => this._error.next(error)
            )
          )
        )
      )
  );

  reload() {
    // this._reload.next(null);
  }
}
