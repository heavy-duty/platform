import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditArgumentComponent } from '@heavy-duty/bulldozer/application/features/edit-argument';
import { EditBasicAccountComponent } from '@heavy-duty/bulldozer/application/features/edit-basic-account';
import { EditInstructionComponent } from '@heavy-duty/bulldozer/application/features/edit-instruction';
import { EditProgramAccountComponent } from '@heavy-duty/bulldozer/application/features/edit-program-account';
import { EditSignerAccountComponent } from '@heavy-duty/bulldozer/application/features/edit-signer-account';
import {
  Instruction,
  InstructionArgument,
  InstructionBasicAccount,
  InstructionProgramAccount,
  InstructionSignerAccount,
  ProgramStore,
} from '@heavy-duty/bulldozer/data-access';
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
  instructions: Instruction[];
  arguments: InstructionArgument[];
  basicAccounts: InstructionBasicAccount[];
  signerAccounts: InstructionSignerAccount[];
  programAccounts: InstructionProgramAccount[];
}

const initialState: ViewModel = {
  instructionId: null,
  instructions: [],
  arguments: [],
  basicAccounts: [],
  signerAccounts: [],
  programAccounts: [],
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
  readonly basicAccounts$ = this.select(({ basicAccounts }) => basicAccounts);
  readonly signerAccounts$ = this.select(
    ({ signerAccounts }) => signerAccounts
  );
  readonly programAccounts$ = this.select(
    ({ programAccounts }) => programAccounts
  );
  readonly accounts$ = this.select(
    this.basicAccounts$,
    this.signerAccounts$,
    this.programAccounts$,
    (basicAccounts, signerAccounts, programAccounts) => [
      ...basicAccounts,
      ...signerAccounts,
      ...programAccounts,
    ]
  );
  readonly accountsCount$ = this.select(
    this.accounts$,
    (accounts) => accounts.length
  );
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);

  constructor(
    private readonly _programStore: ProgramStore,
    private readonly _matDialog: MatDialog,
    private readonly _applicationStore: ApplicationStore,
    private readonly _collectionStore: CollectionStore
  ) {
    super(initialState);
  }

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

  readonly loadArguments = this.effect(() =>
    combineLatest([
      this.instructionId$.pipe(isNotNullOrUndefined),
      this.reload$,
    ]).pipe(
      switchMap(([instructionId]) =>
        this._programStore.getInstructionArguments(instructionId).pipe(
          tapResponse(
            (instructionArguments) =>
              this.patchState({ arguments: instructionArguments }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly loadBasicAccounts = this.effect(() =>
    combineLatest([
      this.instructionId$.pipe(isNotNullOrUndefined),
      this.reload$,
    ]).pipe(
      switchMap(([instructionId]) =>
        this._programStore.getInstructionBasicAccounts(instructionId).pipe(
          tapResponse(
            (basicAccounts) => this.patchState({ basicAccounts }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly loadSignerAccounts = this.effect(() =>
    combineLatest([
      this.instructionId$.pipe(isNotNullOrUndefined),
      this.reload$,
    ]).pipe(
      switchMap(([instructionId]) =>
        this._programStore.getInstructionSignerAccounts(instructionId).pipe(
          tapResponse(
            (signerAccounts) => this.patchState({ signerAccounts }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly loadProgramAccounts = this.effect(() =>
    combineLatest([
      this.instructionId$.pipe(isNotNullOrUndefined),
      this.reload$,
    ]).pipe(
      switchMap(([instructionId]) =>
        this._programStore.getInstructionProgramAccounts(instructionId).pipe(
          tapResponse(
            (programAccounts) => this.patchState({ programAccounts }),
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
                  () => this._reload.next(null),
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
                    () => this._reload.next(null),
                    (error) => this._error.next(error)
                  )
                )
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
              () => this._reload.next(null),
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
                      () => this._reload.next(null),
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
                      () => this._reload.next(null),
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
            () => this._reload.next(null),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly createBasicAccount = this.effect((action$) =>
    action$.pipe(
      concatMap(() =>
        of(null).pipe(withLatestFrom(this._collectionStore.collections$))
      ),
      exhaustMap(([, collections]) =>
        this._matDialog
          .open(EditBasicAccountComponent, { data: { collections } })
          .afterClosed()
          .pipe(
            filter((data) => data),
            withLatestFrom(
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
              this.instructionId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(
              ([
                { name, markAttribute, collection },
                applicationId,
                instructionId,
              ]) =>
                this._programStore
                  .createInstructionBasicAccount(
                    applicationId,
                    instructionId,
                    name,
                    collection,
                    markAttribute
                  )
                  .pipe(
                    tapResponse(
                      () => this._reload.next(null),
                      (error) => this._error.next(error)
                    )
                  )
            )
          )
      )
    )
  );

  readonly updateBasicAccount = this.effect(
    (account$: Observable<InstructionBasicAccount>) =>
      account$.pipe(
        concatMap((account) =>
          of(account).pipe(withLatestFrom(this._collectionStore.collections$))
        ),
        exhaustMap(([account, collections]) =>
          this._matDialog
            .open(EditBasicAccountComponent, {
              data: { account, collections },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name, markAttribute, collection }) =>
                this._programStore
                  .updateInstructionBasicAccount(
                    account.id,
                    name,
                    collection,
                    markAttribute
                  )
                  .pipe(
                    tapResponse(
                      () => this._reload.next(null),
                      (error) => this._error.next(error)
                    )
                  )
              )
            )
        )
      )
  );

  readonly deleteBasicAccount = this.effect((accountId$: Observable<string>) =>
    accountId$.pipe(
      concatMap((accountId) =>
        this._programStore.deleteInstructionBasicAccount(accountId).pipe(
          tapResponse(
            () => this._reload.next(null),
            (error) => this._error.next(error)
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
            concatMap(
              ([{ name, markAttribute }, applicationId, instructionId]) =>
                this._programStore
                  .createInstructionSignerAccount(
                    applicationId,
                    instructionId,
                    name,
                    markAttribute
                  )
                  .pipe(
                    tapResponse(
                      () => this._reload.next(null),
                      (error) => this._error.next(error)
                    )
                  )
            )
          )
      )
    )
  );

  readonly updateSignerAccount = this.effect(
    (account$: Observable<InstructionSignerAccount>) =>
      account$.pipe(
        exhaustMap((account) =>
          this._matDialog
            .open(EditSignerAccountComponent, {
              data: { account },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name, markAttribute }) =>
                this._programStore
                  .updateInstructionSignerAccount(
                    account.id,
                    name,
                    markAttribute
                  )
                  .pipe(
                    tapResponse(
                      () => this._reload.next(null),
                      (error) => this._error.next(error)
                    )
                  )
              )
            )
        )
      )
  );

  readonly deleteSignerAccount = this.effect((accountId$: Observable<string>) =>
    accountId$.pipe(
      concatMap((accountId) =>
        this._programStore.deleteInstructionSignerAccount(accountId).pipe(
          tapResponse(
            () => this._reload.next(null),
            (error) => this._error.next(error)
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
                .createInstructionProgramAccount(
                  applicationId,
                  instructionId,
                  name,
                  program
                )
                .pipe(
                  tapResponse(
                    () => this._reload.next(null),
                    (error) => this._error.next(error)
                  )
                )
            )
          )
      )
    )
  );

  readonly updateProgramAccount = this.effect(
    (account$: Observable<InstructionProgramAccount>) =>
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
                  .updateInstructionProgramAccount(account.id, name, program)
                  .pipe(
                    tapResponse(
                      () => this._reload.next(null),
                      (error) => this._error.next(error)
                    )
                  )
              )
            )
        )
      )
  );

  readonly deleteProgramAccount = this.effect(
    (accountId$: Observable<string>) =>
      accountId$.pipe(
        concatMap((accountId) =>
          this._programStore.deleteInstructionProgramAccount(accountId).pipe(
            tapResponse(
              () => this._reload.next(null),
              (error) => this._error.next(error)
            )
          )
        )
      )
  );

  reload() {
    this._reload.next(null);
  }
}
