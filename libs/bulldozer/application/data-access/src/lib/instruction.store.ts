import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditArgumentComponent } from '@heavy-duty/bulldozer/application/features/edit-argument';
import { EditBasicAccountComponent } from '@heavy-duty/bulldozer/application/features/edit-basic-account';
import { EditInstructionComponent } from '@heavy-duty/bulldozer/application/features/edit-instruction';
import { EditProgramAccountComponent } from '@heavy-duty/bulldozer/application/features/edit-program-account';
import { EditRelationComponent } from '@heavy-duty/bulldozer/application/features/edit-relation';
import { EditSignerAccountComponent } from '@heavy-duty/bulldozer/application/features/edit-signer-account';
import { generateInstructionCode } from '@heavy-duty/bulldozer/application/utils/services/code-generator';
import {
  Instruction,
  InstructionAccountExtended,
  InstructionArgument,
  InstructionExtended,
  InstructionRelationExtended,
} from '@heavy-duty/bulldozer/application/utils/types';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { SystemProgram } from '@solana/web3.js';
import {
  BehaviorSubject,
  combineLatest,
  from,
  Observable,
  of,
  Subject,
} from 'rxjs';
import {
  concatMap,
  exhaustMap,
  filter,
  map,
  switchMap,
  tap,
  toArray,
  withLatestFrom,
} from 'rxjs/operators';

import {
  InstructionAccountCreated,
  InstructionAccountDeleted,
  InstructionAccountUpdated,
  InstructionActions,
  InstructionArgumentCreated,
  InstructionArgumentDeleted,
  InstructionArgumentUpdated,
  InstructionBodyUpdated,
  InstructionCreated,
  InstructionDeleted,
  InstructionInit,
  InstructionRelationCreated,
  InstructionRelationDeleted,
  InstructionRelationUpdated,
  InstructionUpdated,
} from './actions/instruction.actions';
import { ApplicationStore } from './application.store';
import { CollectionStore } from './collection.store';

interface ViewModel {
  instructionId: string | null;
  instructions: InstructionExtended[];
}

const initialState: ViewModel = {
  instructionId: null,
  instructions: [],
};

@Injectable()
export class InstructionStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  private readonly _events = new BehaviorSubject<InstructionActions>(
    new InstructionInit()
  );
  readonly events$ = this._events.asObservable();
  readonly instructions$ = this.select(({ instructions }) => instructions);
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);
  readonly instruction$ = this.select(
    this.instructions$,
    this.instructionId$,
    (instructions, instructionId) =>
      instructions.find(({ id }) => id === instructionId) || null
  );
  readonly instructionArguments$ = this.select(
    this.instruction$,
    (instruction) => instruction && instruction.arguments
  );
  readonly instructionAccounts$ = this.select(
    this.instruction$,
    (instruction) => instruction && instruction.accounts
  );
  readonly instructionBody$ = this.select(
    this.instruction$,
    (instruction) => instruction && instruction.data.body
  );
  readonly instructionContext$ = this.select(
    this.instruction$,
    (instruction) => instruction && generateInstructionCode(instruction)
  );

  constructor(
    private readonly _matDialog: MatDialog,
    private readonly _bulldozerProgramStore: BulldozerProgramStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _collectionStore: CollectionStore
  ) {
    super(initialState);
  }

  readonly updateInstructionBody = this.updater((state, body: string) => {
    return {
      ...state,
      instructions: state.instructions.map((instruction) =>
        instruction.id === state.instructionId
          ? { ...instruction, data: { ...instruction.data, body } }
          : instruction
      ),
    };
  });

  readonly loadInstructions = this.effect(() =>
    combineLatest([
      this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
      this._collectionStore.collections$,
      this.reload$,
    ]).pipe(
      switchMap(([applicationId, collections]) =>
        this._bulldozerProgramStore.getInstructions(applicationId).pipe(
          concatMap((instructions) =>
            from(instructions).pipe(
              concatMap((instruction) =>
                combineLatest([
                  this._bulldozerProgramStore.getInstructionArguments(
                    instruction.id
                  ),
                  this._bulldozerProgramStore.getInstructionAccounts(
                    instruction.id
                  ),
                  this._bulldozerProgramStore.getInstructionRelations(
                    instruction.id
                  ),
                ]).pipe(
                  map(
                    ([
                      instructionArguments,
                      instructionAccounts,
                      instructionRelations,
                    ]) => ({
                      ...instruction,
                      arguments: instructionArguments,
                      accounts: instructionAccounts.map((account) => {
                        const relations = instructionRelations
                          .filter(
                            (relation) => relation.data.from === account.id
                          )
                          .map((relation) => {
                            const toAccount =
                              instructionAccounts.find(
                                (instructionAccount) =>
                                  instructionAccount.id === relation.data.to
                              ) || null;

                            return (
                              toAccount && {
                                ...relation,
                                data: {
                                  ...relation.data,
                                  from: account,
                                  to: toAccount,
                                },
                              }
                            );
                          })
                          .filter(
                            (
                              relation
                            ): relation is InstructionRelationExtended =>
                              relation !== null
                          );

                        const collection =
                          account.data.collection &&
                          collections.find(
                            ({ id }) => id === account.data.collection
                          );

                        const payer =
                          account.data.payer &&
                          instructionAccounts.find(
                            ({ id }) => id === account.data.payer
                          );

                        const close =
                          account.data.close &&
                          instructionAccounts.find(
                            ({ id }) => id === account.data.close
                          );

                        return {
                          ...account,
                          data: {
                            ...account.data,
                            collection: collection || null,
                            payer: payer || null,
                            close: close || null,
                            relations,
                          },
                        };
                      }),
                    })
                  )
                )
              ),
              toArray()
            )
          )
        )
      ),
      tapResponse(
        (instructions) => this.patchState({ instructions }),
        (error) => this._error.next(error)
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
              this._bulldozerProgramStore
                .createInstruction(applicationId, name)
                .pipe(
                  tapResponse(
                    () => this._events.next(new InstructionCreated()),
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
                this._bulldozerProgramStore
                  .updateInstruction(instruction.id, name)
                  .pipe(
                    tapResponse(
                      () =>
                        this._events.next(
                          new InstructionUpdated(instruction.id)
                        ),
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
        this._bulldozerProgramStore.updateInstructionBody(id, body).pipe(
          tapResponse(
            () => this._events.next(new InstructionBodyUpdated(id)),
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
          this._bulldozerProgramStore.deleteInstruction(instructionId).pipe(
            tapResponse(
              () => this._events.next(new InstructionDeleted(instructionId)),
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
                this._bulldozerProgramStore
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
                      () => this._events.next(new InstructionArgumentCreated()),
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
                this._bulldozerProgramStore
                  .updateInstructionArgument(
                    argument.id,
                    name,
                    kind,
                    modifier,
                    size
                  )
                  .pipe(
                    tapResponse(
                      () =>
                        this._events.next(
                          new InstructionArgumentUpdated(argument.id)
                        ),
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
        this._bulldozerProgramStore.deleteInstructionArgument(argumentId).pipe(
          tapResponse(
            () => this._events.next(new InstructionArgumentDeleted(argumentId)),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly createRelation = this.effect((action$) =>
    action$.pipe(
      concatMap(() => of(null).pipe(withLatestFrom(this.instructionAccounts$))),
      exhaustMap(([, accounts]) =>
        this._matDialog
          .open(EditRelationComponent, { data: { accounts } })
          .afterClosed()
          .pipe(
            filter((data) => data),
            withLatestFrom(
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
              this.instructionId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(([{ from, to }, applicationId, instructionId]) =>
              this._bulldozerProgramStore
                .createInstructionRelation(
                  applicationId,
                  instructionId,
                  from,
                  to
                )
                .pipe(
                  tapResponse(
                    () => this._events.next(new InstructionRelationCreated()),
                    (error) => this._error.next(error)
                  )
                )
            )
          )
      )
    )
  );

  readonly updateRelation = this.effect(
    (relation$: Observable<InstructionRelationExtended>) =>
      relation$.pipe(
        concatMap((relation) =>
          of(relation).pipe(withLatestFrom(this.instructionAccounts$))
        ),
        exhaustMap(([relation, accounts]) =>
          this._matDialog
            .open(EditRelationComponent, {
              data: { relation, accounts },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ from, to }) =>
                this._bulldozerProgramStore
                  .updateInstructionRelation(relation.id, from, to)
                  .pipe(
                    tapResponse(
                      () =>
                        this._events.next(
                          new InstructionRelationUpdated(relation.id)
                        ),
                      (error) => this._error.next(error)
                    )
                  )
              )
            )
        )
      )
  );

  readonly deleteRelation = this.effect((relationId$: Observable<string>) =>
    relationId$.pipe(
      concatMap((relationId) =>
        this._bulldozerProgramStore.deleteInstructionRelation(relationId).pipe(
          tapResponse(
            () => this._events.next(new InstructionRelationDeleted(relationId)),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly deleteAccount = this.effect((accountId$: Observable<string>) =>
    accountId$.pipe(
      concatMap((accountId) =>
        this._bulldozerProgramStore.deleteInstructionAccount(accountId).pipe(
          tapResponse(
            () => this._events.next(new InstructionAccountDeleted(accountId)),
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
          withLatestFrom(
            this._collectionStore.collections$,
            this.instructionAccounts$
          )
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
                this._bulldozerProgramStore
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
                      () => this._events.next(new InstructionAccountCreated()),
                      (error) => this._error.next(error)
                    )
                  )
            )
          )
      )
    )
  );

  readonly updateBasicAccount = this.effect(
    (account$: Observable<InstructionAccountExtended>) =>
      account$.pipe(
        concatMap((account) =>
          of(account).pipe(
            withLatestFrom(
              this._collectionStore.collections$,
              this.instructionAccounts$
            )
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
                this._bulldozerProgramStore
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
                      () =>
                        this._events.next(
                          new InstructionAccountUpdated(account.id)
                        ),
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
              this._bulldozerProgramStore
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
                    () => this._events.next(new InstructionAccountCreated()),
                    (error) => this._error.next(error)
                  )
                )
            )
          )
      )
    )
  );

  readonly updateSignerAccount = this.effect(
    (account$: Observable<InstructionAccountExtended>) =>
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
                this._bulldozerProgramStore
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
                      () =>
                        this._events.next(
                          new InstructionAccountUpdated(account.id)
                        ),
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
              this._bulldozerProgramStore
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
                    () => this._events.next(new InstructionAccountCreated()),
                    (error) => this._error.next(error)
                  )
                )
            )
          )
      )
    )
  );

  readonly updateProgramAccount = this.effect(
    (account$: Observable<InstructionAccountExtended>) =>
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
                this._bulldozerProgramStore
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
                      () =>
                        this._events.next(
                          new InstructionAccountUpdated(account.id)
                        ),
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
