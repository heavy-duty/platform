import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditArgumentComponent } from '@heavy-duty/bulldozer/application/features/edit-argument';
import { EditBasicAccountComponent } from '@heavy-duty/bulldozer/application/features/edit-basic-account';
import { EditInstructionComponent } from '@heavy-duty/bulldozer/application/features/edit-instruction';
import { EditProgramAccountComponent } from '@heavy-duty/bulldozer/application/features/edit-program-account';
import { EditSignerAccountComponent } from '@heavy-duty/bulldozer/application/features/edit-signer-account';
import {
  Instruction,
  InstructionArgument,
  PopulatedInstructionAccount,
  ProgramStore,
} from '@heavy-duty/bulldozer/data-access';
import { generateInstructionsRustCode } from '@heavy-duty/code-generator';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { SystemProgram } from '@solana/web3.js';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import {
  concatMap,
  exhaustMap,
  filter,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { ApplicationStore } from './application.store';
import { CollectionStore } from './collection.store';

interface ViewModel {
  instructionId: string | null;
  instruction: Instruction | null;
  instructions: Instruction[];
  arguments: InstructionArgument[];
  accounts: PopulatedInstructionAccount[];
}

const initialState: ViewModel = {
  instructionId: null,
  instruction: null,
  instructions: [],
  arguments: [],
  accounts: [],
};

@Injectable()
export class InstructionStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  readonly instructions$ = this.select(({ instructions }) => instructions);
  readonly arguments$ = this.select(
    ({ arguments: instructionArguments }) => instructionArguments
  );
  readonly accounts$ = this.select(({ accounts }) => accounts);
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);
  readonly instruction$ = this.select(({ instruction }) => instruction);
  readonly instructionBody$ = this.select(
    this.instruction$,
    (instruction) => instruction && instruction.data.body
  );
  readonly instructionContext$ = this.select(
    this.instruction$,
    this.arguments$,
    this.accounts$,
    (instruction, instructionArguments, instructionsAccounts) =>
      instruction &&
      generateInstructionsRustCode(
        instruction,
        instructionArguments,
        instructionsAccounts
      )
  );

  constructor(
    private readonly _matDialog: MatDialog,
    private readonly _matSnackBar: MatSnackBar,
    private readonly _programStore: ProgramStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _collectionStore: CollectionStore
  ) {
    super(initialState);
  }

  readonly updateInstructionBody = this.updater((state, body: string) => ({
    ...state,
    instruction: state.instruction && {
      ...state.instruction,
      data: {
        ...state.instruction.data,
        body,
      },
    },
  }));

  readonly loadInstructions = this.effect(() =>
    combineLatest([
      this.reload$,
      this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
    ]).pipe(
      switchMap(([, applicationId]) =>
        this._programStore.getInstructions(applicationId).pipe(
          tapResponse(
            (instructions) => this.patchState({ instructions }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly loadInstruction = this.effect(() =>
    combineLatest([
      this.instructionId$.pipe(isNotNullOrUndefined),
      this._collectionStore.collections$,
      this.reload$,
    ]).pipe(
      switchMap(([instructionId, collections]) =>
        combineLatest([
          this._programStore.getInstruction(instructionId),
          this._programStore.getInstructionArguments(instructionId),
          this._programStore.getInstructionAccounts(instructionId),
        ]).pipe(
          tapResponse(
            ([instruction, instructionArguments, accounts]) =>
              this.patchState({
                instruction: instruction,
                accounts: accounts.map((account) => {
                  const collection =
                    account.data.collection &&
                    collections.find(
                      ({ id }) => id === account.data.collection
                    );

                  const payer =
                    account.data.payer &&
                    accounts.find(({ id }) => id === account.data.payer);

                  const close =
                    account.data.close &&
                    accounts.find(({ id }) => id === account.data.close);

                  return {
                    ...account,
                    data: {
                      ...account.data,
                      collection: collection || null,
                      payer: payer || null,
                      close: close || null,
                    },
                  };
                }),
                arguments: instructionArguments,
              }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly selectInstruction = this.effect(
    (instructionId$: Observable<string | null>) =>
      instructionId$.pipe(
        tap((instructionId) => this.patchState({ instructionId }))
      )
  );

  readonly createInstruction = this.effect((action$) =>
    action$.pipe(
      exhaustMap(() =>
        this._matDialog
          .open(EditInstructionComponent)
          .afterClosed()
          .pipe(
            filter((data) => data),
            withLatestFrom(
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(([{ name }, applicationId]) =>
              this._programStore.createInstruction(applicationId, name).pipe(
                tapResponse(
                  () => {
                    this._reload.next(null);
                    this._matSnackBar.open('Instruction created', 'Close', {
                      panelClass: 'success-snackbar',
                      duration: 3000,
                    });
                  },
                  (error) => this._error.next(error)
                )
              )
            )
          )
      )
    )
  );

  readonly updateInstruction = this.effect(
    (instruction$: Observable<Instruction>) =>
      instruction$.pipe(
        exhaustMap((instruction) =>
          this._matDialog
            .open(EditInstructionComponent, { data: { instruction } })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name }) =>
                this._programStore.updateInstruction(instruction.id, name).pipe(
                  tapResponse(
                    () => {
                      this._reload.next(null);
                      this._matSnackBar.open('Instruction updated', 'Close', {
                        panelClass: 'success-snackbar',
                        duration: 3000,
                      });
                    },
                    (error) => this._error.next(error)
                  )
                )
              )
            )
        )
      )
  );

  readonly saveInstructionBody = this.effect((action$) =>
    action$.pipe(
      concatMap(() =>
        of(null).pipe(
          withLatestFrom(
            this.instruction$.pipe(isNotNullOrUndefined),
            (_, instruction) => instruction
          )
        )
      ),
      concatMap(({ id, data: { body } }) =>
        this._programStore.updateInstructionBody(id, body).pipe(
          tapResponse(
            () => {
              this._reload.next(null);
              this._matSnackBar.open('Instruction body updated', 'Close', {
                panelClass: 'success-snackbar',
                duration: 3000,
              });
            },
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly deleteInstruction = this.effect(
    (instructionId$: Observable<string>) =>
      instructionId$.pipe(
        concatMap((instructionId) =>
          this._programStore.deleteInstruction(instructionId).pipe(
            tapResponse(
              () => {
                this._reload.next(null);
                this._matSnackBar.open('Instruction deleted', 'Close', {
                  panelClass: 'success-snackbar',
                  duration: 3000,
                });
              },
              (error) => this._error.next(error)
            )
          )
        )
      )
  );

  readonly createArgument = this.effect((action$) =>
    action$.pipe(
      exhaustMap(() =>
        this._matDialog
          .open(EditArgumentComponent)
          .afterClosed()
          .pipe(
            filter((data) => data),
            withLatestFrom(
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
              this.instructionId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(
              ([
                { name, kind, modifier, size },
                applicationId,
                instructionId,
              ]) =>
                this._programStore
                  .createInstructionArgument(
                    applicationId,
                    instructionId,
                    name,
                    kind,
                    modifier,
                    size
                  )
                  .pipe(
                    tapResponse(
                      () => {
                        this._reload.next(null);
                        this._matSnackBar.open('Argument created', 'Close', {
                          panelClass: 'success-snackbar',
                          duration: 3000,
                        });
                      },
                      (error) => this._error.next(error)
                    )
                  )
            )
          )
      )
    )
  );

  readonly updateArgument = this.effect(
    (argument$: Observable<InstructionArgument>) =>
      argument$.pipe(
        exhaustMap((argument) =>
          this._matDialog
            .open(EditArgumentComponent, {
              data: { argument },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name, kind, modifier, size }) =>
                this._programStore
                  .updateInstructionArgument(
                    argument.id,
                    name,
                    kind,
                    modifier,
                    size
                  )
                  .pipe(
                    tapResponse(
                      () => {
                        this._reload.next(null);
                        this._matSnackBar.open('Argument updated', 'Close', {
                          panelClass: 'success-snackbar',
                          duration: 3000,
                        });
                      },
                      (error) => this._error.next(error)
                    )
                  )
              )
            )
        )
      )
  );

  readonly deleteArgument = this.effect((argumentId$: Observable<string>) =>
    argumentId$.pipe(
      concatMap((argumentId) =>
        this._programStore.deleteInstructionArgument(argumentId).pipe(
          tapResponse(
            () => {
              this._reload.next(null);
              this._matSnackBar.open('Argument deleted', 'Close', {
                panelClass: 'success-snackbar',
                duration: 3000,
              });
            },
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly deleteAccount = this.effect((accountId$: Observable<string>) =>
    accountId$.pipe(
      concatMap((accountId) =>
        this._programStore.deleteInstructionAccount(accountId).pipe(
          tapResponse(
            () => {
              this._reload.next(null);
              this._matSnackBar.open('Account deleted', 'Close', {
                panelClass: 'success-snackbar',
                duration: 3000,
              });
            },
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly createBasicAccount = this.effect((action$) =>
    action$.pipe(
      concatMap(() =>
        of(null).pipe(
          withLatestFrom(this._collectionStore.collections$, this.accounts$)
        )
      ),
      exhaustMap(([, collections, accounts]) =>
        this._matDialog
          .open(EditBasicAccountComponent, { data: { collections, accounts } })
          .afterClosed()
          .pipe(
            filter((data) => data),
            withLatestFrom(
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
              this.instructionId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(
              ([
                { name, modifier, collection, space, payer, close },
                applicationId,
                instructionId,
              ]) =>
                this._programStore
                  .createInstructionAccount(
                    applicationId,
                    instructionId,
                    name,
                    0,
                    modifier,
                    space,
                    null,
                    collection,
                    payer,
                    close
                  )
                  .pipe(
                    tapResponse(
                      () => {
                        this._reload.next(null);
                        this._matSnackBar.open(
                          'Basic account created',
                          'Close',
                          {
                            panelClass: 'success-snackbar',
                            duration: 3000,
                          }
                        );
                      },
                      (error) => this._error.next(error)
                    )
                  )
            )
          )
      )
    )
  );

  readonly updateBasicAccount = this.effect(
    (account$: Observable<PopulatedInstructionAccount>) =>
      account$.pipe(
        concatMap((account) =>
          of(account).pipe(
            withLatestFrom(this._collectionStore.collections$, this.accounts$)
          )
        ),
        exhaustMap(([account, collections, accounts]) =>
          this._matDialog
            .open(EditBasicAccountComponent, {
              data: { account, collections, accounts },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name, modifier, collection, space, payer, close }) =>
                this._programStore
                  .updateInstructionAccount(
                    account.id,
                    name,
                    0,
                    modifier,
                    space,
                    null,
                    collection,
                    payer,
                    close
                  )
                  .pipe(
                    tapResponse(
                      () => {
                        this._reload.next(null);
                        this._matSnackBar.open(
                          'Basic account updated',
                          'Close',
                          {
                            panelClass: 'success-snackbar',
                            duration: 3000,
                          }
                        );
                      },
                      (error) => this._error.next(error)
                    )
                  )
              )
            )
        )
      )
  );

  readonly createSignerAccount = this.effect((action$) =>
    action$.pipe(
      exhaustMap(() =>
        this._matDialog
          .open(EditSignerAccountComponent)
          .afterClosed()
          .pipe(
            filter((data) => data),
            withLatestFrom(
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
              this.instructionId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(([{ name, modifier }, applicationId, instructionId]) =>
              this._programStore
                .createInstructionAccount(
                  applicationId,
                  instructionId,
                  name,
                  2,
                  modifier,
                  null,
                  null,
                  null,
                  null,
                  null
                )
                .pipe(
                  tapResponse(
                    () => {
                      this._reload.next(null);
                      this._matSnackBar.open(
                        'Signer account created',
                        'Close',
                        {
                          panelClass: 'success-snackbar',
                          duration: 3000,
                        }
                      );
                    },
                    (error) => this._error.next(error)
                  )
                )
            )
          )
      )
    )
  );

  readonly updateSignerAccount = this.effect(
    (account$: Observable<PopulatedInstructionAccount>) =>
      account$.pipe(
        exhaustMap((account) =>
          this._matDialog
            .open(EditSignerAccountComponent, {
              data: { account },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name, modifier }) =>
                this._programStore
                  .updateInstructionAccount(
                    account.id,
                    name,
                    2,
                    modifier,
                    null,
                    null,
                    null,
                    null,
                    null
                  )
                  .pipe(
                    tapResponse(
                      () => {
                        this._reload.next(null);
                        this._matSnackBar.open(
                          'Signer account updated',
                          'Close',
                          {
                            panelClass: 'success-snackbar',
                            duration: 3000,
                          }
                        );
                      },
                      (error) => this._error.next(error)
                    )
                  )
              )
            )
        )
      )
  );

  readonly createProgramAccount = this.effect((action$) =>
    action$.pipe(
      exhaustMap(() =>
        this._matDialog
          .open(EditProgramAccountComponent, {
            data: {
              programs: [
                {
                  id: SystemProgram.programId.toBase58(),
                  name: 'System program',
                },
              ],
            },
          })
          .afterClosed()
          .pipe(
            filter((data) => data),
            withLatestFrom(
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
              this.instructionId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(([{ name, program }, applicationId, instructionId]) =>
              this._programStore
                .createInstructionAccount(
                  applicationId,
                  instructionId,
                  name,
                  1,
                  0,
                  null,
                  program,
                  null,
                  null,
                  null
                )
                .pipe(
                  tapResponse(
                    () => {
                      this._reload.next(null);
                      this._matSnackBar.open(
                        'Program account created',
                        'Close',
                        {
                          panelClass: 'success-snackbar',
                          duration: 3000,
                        }
                      );
                    },
                    (error) => this._error.next(error)
                  )
                )
            )
          )
      )
    )
  );

  readonly updateProgramAccount = this.effect(
    (account$: Observable<PopulatedInstructionAccount>) =>
      account$.pipe(
        exhaustMap((account) =>
          this._matDialog
            .open(EditProgramAccountComponent, {
              data: {
                account,
                programs: [
                  {
                    id: SystemProgram.programId.toBase58(),
                    name: 'System program',
                  },
                ],
              },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name, program }) =>
                this._programStore
                  .updateInstructionAccount(
                    account.id,
                    name,
                    1,
                    0,
                    null,
                    program,
                    null,
                    null,
                    null
                  )
                  .pipe(
                    tapResponse(
                      () => {
                        this._reload.next(null);
                        this._matSnackBar.open(
                          'Program account updated',
                          'Close',
                          {
                            panelClass: 'success-snackbar',
                            duration: 3000,
                          }
                        );
                      },
                      (error) => this._error.next(error)
                    )
                  )
              )
            )
        )
      )
  );

  reload() {
    this._reload.next(null);
  }
}
