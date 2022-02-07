import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  InstructionAccountApiService,
  InstructionAccountSocketService,
} from '@bulldozer-client/instructions-data-access';
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
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
  withLatestFrom,
} from 'rxjs';

interface ViewModel {
  loading: boolean;
  instructionAccountsMap: Map<string, Document<InstructionAccount>>;
  error: unknown | null;
}

const initialState: ViewModel = {
  loading: false,
  instructionAccountsMap: new Map<string, Document<InstructionAccount>>(),
  error: null,
};

@Injectable()
export class ViewInstructionAccountsStore extends ComponentStore<ViewModel> {
  readonly error$ = this.select(({ error }) => error);
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
    private readonly _walletStore: WalletStore,
    private readonly _route: ActivatedRoute
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

  private readonly _setError = this.updater((state, error: unknown) => ({
    ...state,
    error,
  }));

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
                (error) => this._setError(error)
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
    this._route.paramMap.pipe(
      map((paramMap) => paramMap.get('instructionId')),
      switchMap((instructionId) => {
        if (instructionId === null) {
          return of(null);
        }

        return this._instructionAccountSocketService
          .instructionAccountCreated({
            instruction: instructionId,
          })
          .pipe(
            tapResponse(
              (instructionAccount) => {
                this._addInstructionAccount(instructionAccount);
                this._handleInstructionAccountChanges(instructionAccount.id);
              },
              (error) => this._setError(error)
            )
          );
      })
    )
  );

  protected readonly loadInstructionAccounts = this.effect(() =>
    this._route.paramMap.pipe(
      map((paramMap) => paramMap.get('instructionId')),
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
        (error) => this._setError(error)
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
              this._route.paramMap.pipe(
                map((paramMap) => paramMap.get('workspaceId'))
              ),
              this._route.paramMap.pipe(
                map((paramMap) => paramMap.get('applicationId'))
              ),
              this._route.paramMap.pipe(
                map((paramMap) => paramMap.get('instructionId'))
              ),
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
              authority: authority?.toBase58(),
              instructionAccountId,
            });
          }
        )
      )
  );

  readonly deleteInstructionAccount = this.effect(
    ($: Observable<{ instructionAccountId: string }>) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(
            withLatestFrom(
              this._route.paramMap.pipe(
                map((paramMap) => paramMap.get('instructionId'))
              ),
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
        })
      )
  );
}
