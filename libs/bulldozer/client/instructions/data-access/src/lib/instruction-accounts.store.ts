import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/core-data-access';
import {
  Document,
  Instruction,
  InstructionAccount,
  InstructionAccountDto,
  InstructionAccountFilters,
} from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  filter,
  first,
  mergeMap,
  of,
  pipe,
  switchMap,
  takeUntil,
  takeWhile,
  withLatestFrom,
} from 'rxjs';
import { InstructionAccountApiService } from './instruction-account-api.service';
import { InstructionAccountEventService } from './instruction-account-event.service';

interface ViewModel {
  loading: boolean;
  filters: InstructionAccountFilters | null;
  instructionAccountsMap: Map<string, Document<InstructionAccount>>;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  instructionAccountsMap: new Map<string, Document<InstructionAccount>>(),
};

@Injectable()
export class InstructionAccountsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
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

  constructor(
    private readonly _instructionAccountApiService: InstructionAccountApiService,
    private readonly _instructionAccountEventService: InstructionAccountEventService,
    private readonly _notificationStore: NotificationStore,
    private readonly _walletStore: WalletStore
  ) {
    super(initialState);

    this._loadInstructionAccounts(this.filters$);
    this._handleInstructionAccountCreated(this.filters$);
  }

  private readonly _setInstructionAccount = this.updater<
    Document<InstructionAccount>
  >((state, newInstructionAccount) => {
    const instructionAccountsMap = new Map(state.instructionAccountsMap);
    instructionAccountsMap.set(newInstructionAccount.id, newInstructionAccount);
    return {
      ...state,
      instructionAccountsMap,
    };
  });

  private readonly _addInstructionAccount = this.updater<
    Document<InstructionAccount>
  >((state, newInstructionAccount) => {
    if (state.instructionAccountsMap.has(newInstructionAccount.id)) {
      return state;
    }
    const instructionAccountsMap = new Map(state.instructionAccountsMap);
    instructionAccountsMap.set(newInstructionAccount.id, newInstructionAccount);
    return {
      ...state,
      instructionAccountsMap,
    };
  });

  private readonly _removeInstructionAccount = this.updater<string>(
    (state, instructionAccountId) => {
      const instructionAccountsMap = new Map(state.instructionAccountsMap);
      instructionAccountsMap.delete(instructionAccountId);
      return {
        ...state,
        instructionAccountsMap,
      };
    }
  );

  private readonly _handleInstructionAccountChanges = this.effect<string>(
    mergeMap((instructionAccountId) =>
      this._instructionAccountEventService
        .instructionAccountChanges(instructionAccountId)
        .pipe(
          tapResponse(
            (changes) => {
              if (changes === null) {
                this._removeInstructionAccount(instructionAccountId);
              } else {
                this._setInstructionAccount(changes);
              }
            },
            (error) => this._notificationStore.setError(error)
          ),
          takeUntil(
            this.loading$.pipe(
              filter((loading) => loading),
              first()
            )
          ),
          takeWhile((instruction) => instruction !== null)
        )
    )
  );

  private readonly _handleInstructionAccountCreated =
    this.effect<InstructionAccountFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        return this._instructionAccountEventService
          .instructionAccountCreated(filters)
          .pipe(
            tapResponse(
              (instructionAccount) => {
                this._addInstructionAccount(instructionAccount);
                this._handleInstructionAccountChanges(instructionAccount.id);
              },
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    );

  private readonly _loadInstructionAccounts =
    this.effect<InstructionAccountFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        this.patchState({ loading: true });

        return this._instructionAccountApiService.find(filters).pipe(
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
                loading: false,
              });
              instructionAccounts.forEach(({ id }) =>
                this._handleInstructionAccountChanges(id)
              );
            },
            (error) => this._notificationStore.setError(error)
          )
        );
      })
    );

  readonly setFilters = this.updater<InstructionAccountFilters>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );

  readonly createInstructionAccount = this.effect<{
    instruction: Document<Instruction>;
    instructionAccountDto: InstructionAccountDto;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ instruction, instructionAccountDto }, authority]) => {
        if (instruction === null || authority === null) {
          return EMPTY;
        }

        return this._instructionAccountApiService
          .create({
            instructionAccountDto,
            authority: authority.toBase58(),
            workspaceId: instruction.data.workspace,
            applicationId: instruction.data.application,
            instructionId: instruction.id,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent('Create account request sent'),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );

  readonly updateInstructionAccount = this.effect<{
    instructionAccountId: string;
    instructionAccountDto: InstructionAccountDto;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([{ instructionAccountId, instructionAccountDto }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionAccountApiService
            .update({
              instructionAccountDto,
              authority: authority.toBase58(),
              instructionAccountId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Update account request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly deleteInstructionAccount = this.effect<{
    instructionId: string;
    instructionAccountId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ instructionId, instructionAccountId }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._instructionAccountApiService
          .delete({
            authority: authority.toBase58(),
            instructionAccountId,
            instructionId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent('Delete account request sent'),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );
}
