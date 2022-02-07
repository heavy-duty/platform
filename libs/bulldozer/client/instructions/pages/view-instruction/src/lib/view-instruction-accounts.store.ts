import { Injectable } from '@angular/core';
import {
  InstructionAccountApiService,
  InstructionAccountSocketService,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notification-store';
import {
  Document,
  InstructionAccount,
  InstructionAccountDto,
} from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  filter,
  first,
  mergeMap,
  Observable,
  of,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
  withLatestFrom,
} from 'rxjs';
import { ViewInstructionRouteStore } from './view-instruction-route.store';

interface ViewModel {
  loading: boolean;
  instructionAccountsMap: Map<string, Document<InstructionAccount>>;
}

const initialState: ViewModel = {
  loading: false,
  instructionAccountsMap: new Map<string, Document<InstructionAccount>>(),
};

@Injectable()
export class ViewInstructionAccountsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
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
    private readonly _instructionAccountSocketService: InstructionAccountSocketService,
    private readonly _viewInstructionRouteStore: ViewInstructionRouteStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _walletStore: WalletStore
  ) {
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

  private readonly _handleInstructionAccountChanges = this.effect(
    (instructionAccountId$: Observable<string>) =>
      instructionAccountId$.pipe(
        mergeMap((instructionAccountId) =>
          this._instructionAccountSocketService
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
      )
  );

  protected readonly handleInstructionAccountCreated = this.effect(() =>
    this._viewInstructionRouteStore.instructionId$.pipe(
      switchMap((instructionId) => {
        if (instructionId === null) {
          return EMPTY;
        }

        return this._instructionAccountSocketService.instructionAccountCreated({
          instruction: instructionId,
        });
      }),
      tapResponse(
        (instructionAccount) => {
          this._addInstructionAccount(instructionAccount);
          this._handleInstructionAccountChanges(instructionAccount.id);
        },
        (error) => this._notificationStore.setError(error)
      )
    )
  );

  protected readonly loadInstructionAccounts = this.effect(() =>
    this._viewInstructionRouteStore.instructionId$.pipe(
      tap(() => this.patchState({ loading: true })),
      switchMap((instructionId) => {
        if (instructionId === null) {
          return of([]);
        }

        return this._instructionAccountApiService.find({
          instruction: instructionId,
        });
      }),
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
    )
  );

  readonly createInstructionAccount = this.effect(
    (
      $: Observable<{
        instructionAccountDto: InstructionAccountDto;
      }>
    ) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(
            withLatestFrom(
              this._viewInstructionRouteStore.workspaceId$,
              this._viewInstructionRouteStore.applicationId$,
              this._viewInstructionRouteStore.instructionId$,
              this._walletStore.publicKey$
            )
          )
        ),
        concatMap(
          ([
            { instructionAccountDto },
            workspaceId,
            applicationId,
            instructionId,
            authority,
          ]) => {
            if (
              workspaceId === null ||
              applicationId === null ||
              instructionId === null ||
              authority === null
            ) {
              return EMPTY;
            }

            return this._instructionAccountApiService.create({
              instructionAccountDto,
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
              instructionId,
            });
          }
        ),
        tapResponse(
          () => this._notificationStore.setEvent('Create account request sent'),
          (error) => this._notificationStore.setError(error)
        )
      )
  );

  readonly updateInstructionAccount = this.effect(
    (
      $: Observable<{
        instructionAccountId: string;
        instructionAccountDto: InstructionAccountDto;
      }>
    ) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
        ),
        concatMap(
          ([{ instructionAccountId, instructionAccountDto }, authority]) => {
            if (authority === null) {
              return EMPTY;
            }

            return this._instructionAccountApiService.update({
              instructionAccountDto,
              authority: authority.toBase58(),
              instructionAccountId,
            });
          }
        ),
        tapResponse(
          () => this._notificationStore.setEvent('Update account request sent'),
          (error) => this._notificationStore.setError(error)
        )
      )
  );

  readonly deleteInstructionAccount = this.effect(
    ($: Observable<{ instructionAccountId: string }>) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(
            withLatestFrom(
              this._viewInstructionRouteStore.instructionId$,
              this._walletStore.publicKey$
            )
          )
        ),
        concatMap(([{ instructionAccountId }, instructionId, authority]) => {
          if (instructionId === null || authority === null) {
            return EMPTY;
          }

          return this._instructionAccountApiService.delete({
            authority: authority.toBase58(),
            instructionAccountId,
            instructionId,
          });
        }),
        tapResponse(
          () => this._notificationStore.setEvent('Delete account request sent'),
          (error) => this._notificationStore.setError(error)
        )
      )
  );
}
