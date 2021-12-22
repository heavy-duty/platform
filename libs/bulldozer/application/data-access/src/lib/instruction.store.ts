import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditArgumentComponent } from '@heavy-duty/bulldozer/application/features/edit-argument';
import { EditDocumentComponent } from '@heavy-duty/bulldozer/application/features/edit-document';
import { EditInstructionComponent } from '@heavy-duty/bulldozer/application/features/edit-instruction';
import { EditRelationComponent } from '@heavy-duty/bulldozer/application/features/edit-relation';
import { EditSignerComponent } from '@heavy-duty/bulldozer/application/features/edit-signer';
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
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import {
  concatMap,
  exhaustMap,
  filter,
  switchMap,
  tap,
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
import { WorkspaceStore } from './workspace.store';

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
  readonly activeInstructions$ = this.select(
    this.instructions$,
    this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
    (instructions, applicationId) =>
      instructions.filter(
        (instruction) => instruction.data.application === applicationId
      )
  );
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
  readonly documents$ = this.select(
    this.instructionAccounts$,
    (accounts) =>
      accounts && accounts.filter((account) => account.data.kind.id === 0)
  );
  readonly signers$ = this.select(
    this.instructionAccounts$,
    (accounts) =>
      accounts && accounts.filter((account) => account.data.kind.id === 1)
  );

  constructor(
    private readonly _matDialog: MatDialog,
    private readonly _bulldozerProgramStore: BulldozerProgramStore,
    private readonly _workspaceStore: WorkspaceStore,
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
      this._workspaceStore.workspaceId$.pipe(isNotNullOrUndefined),
      this.reload$,
    ]).pipe(
      switchMap(([workspaceId]) =>
        this._bulldozerProgramStore.getExtendedInstructions(workspaceId).pipe(
          tapResponse(
            (instructions) => this.patchState({ instructions }),
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
              this._workspaceStore.workspaceId$.pipe(isNotNullOrUndefined),
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(([{ name }, workspaceId, applicationId]) =>
              this._bulldozerProgramStore
                .createInstruction(workspaceId, applicationId, name)
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
              this._workspaceStore.workspaceId$.pipe(isNotNullOrUndefined),
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
              this.instructionId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(
              ([
                instructionArgumentDto,
                workspaceId,
                applicationId,
                instructionId,
              ]) =>
                this._bulldozerProgramStore
                  .createInstructionArgument(
                    workspaceId,
                    applicationId,
                    instructionId,
                    instructionArgumentDto
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
              concatMap((instructionArgumentDto) =>
                this._bulldozerProgramStore
                  .updateInstructionArgument(
                    argument.id,
                    instructionArgumentDto
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
              this._workspaceStore.workspaceId$.pipe(isNotNullOrUndefined),
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
              this.instructionId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(
              ([{ from, to }, workspaceId, applicationId, instructionId]) =>
                this._bulldozerProgramStore
                  .createInstructionRelation(
                    workspaceId,
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

  readonly createDocument = this.effect((action$) =>
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
          .open(EditDocumentComponent, { data: { collections, accounts } })
          .afterClosed()
          .pipe(
            filter((data) => data),
            withLatestFrom(
              this._workspaceStore.workspaceId$.pipe(isNotNullOrUndefined),
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
              this.instructionId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(
              ([
                { name, modifier, collection, space, payer, close },
                workspaceId,
                applicationId,
                instructionId,
              ]) =>
                this._bulldozerProgramStore
                  .createInstructionAccount(
                    workspaceId,
                    applicationId,
                    instructionId,
                    { name, kind: 0, modifier, space },
                    { collection, payer, close }
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

  readonly updateDocument = this.effect(
    (document$: Observable<InstructionAccountExtended>) =>
      document$.pipe(
        concatMap((document) =>
          of(document).pipe(
            withLatestFrom(
              this._collectionStore.collections$,
              this.instructionAccounts$
            )
          )
        ),
        exhaustMap(([document, collections, accounts]) =>
          this._matDialog
            .open(EditDocumentComponent, {
              data: { document, collections, accounts },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name, modifier, collection, space, payer, close }) =>
                this._bulldozerProgramStore
                  .updateInstructionAccount(
                    document.id,
                    {
                      name,
                      kind: 0,
                      modifier,
                      space,
                    },
                    { collection, payer, close }
                  )
                  .pipe(
                    tapResponse(
                      () =>
                        this._events.next(
                          new InstructionAccountUpdated(document.id)
                        ),
                      (error) => this._error.next(error)
                    )
                  )
              )
            )
        )
      )
  );

  readonly createSigner = this.effect((action$) =>
    action$.pipe(
      exhaustMap(() =>
        this._matDialog
          .open(EditSignerComponent)
          .afterClosed()
          .pipe(
            filter((data) => data),
            withLatestFrom(
              this._workspaceStore.workspaceId$.pipe(isNotNullOrUndefined),
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
              this.instructionId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(
              ([
                instructionAccountDto,
                workspaceId,
                applicationId,
                instructionId,
              ]) =>
                this._bulldozerProgramStore
                  .createInstructionAccount(
                    workspaceId,
                    applicationId,
                    instructionId,
                    {
                      kind: 1,
                      space: null,
                      ...instructionAccountDto,
                    },
                    {
                      collection: null,
                      payer: null,
                      close: null,
                    }
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

  readonly updateSigner = this.effect(
    (signer$: Observable<InstructionAccountExtended>) =>
      signer$.pipe(
        exhaustMap((signer) =>
          this._matDialog
            .open(EditSignerComponent, {
              data: { signer },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap((instructionAccountDto) =>
                this._bulldozerProgramStore
                  .updateInstructionAccount(
                    signer.id,
                    {
                      kind: 1,
                      space: null,
                      ...instructionAccountDto,
                    },
                    {
                      collection: null,
                      payer: null,
                      close: null,
                    }
                  )
                  .pipe(
                    tapResponse(
                      () =>
                        this._events.next(
                          new InstructionAccountUpdated(signer.id)
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
