import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import {
  Collection,
  Document,
  Instruction,
  InstructionAccount,
  InstructionArgument,
  InstructionRelation,
} from '@heavy-duty/bulldozer-devkit';
import {
  ApplicationStore,
  CollectionStore,
  InstructionAccountStore,
  InstructionArgumentStore,
  InstructionRelationStore,
  InstructionStore,
  TabStore,
  WorkspaceStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { EditArgumentComponent } from '@heavy-duty/bulldozer/application/features/edit-argument';
import { EditDocumentComponent } from '@heavy-duty/bulldozer/application/features/edit-document';
import { EditRelationComponent } from '@heavy-duty/bulldozer/application/features/edit-relation';
import { EditSignerComponent } from '@heavy-duty/bulldozer/application/features/edit-signer';
import { DarkThemeService } from '@heavy-duty/bulldozer/application/utils/services/dark-theme';
import { generateInstructionCode } from '@heavy-duty/generator';
import {
  isNotNullOrUndefined,
  isTruthy,
} from '@heavy-duty/shared/utils/operators';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest, Observable, of } from 'rxjs';
import {
  concatMap,
  exhaustMap,
  filter,
  map,
  startWith,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

@Injectable()
export class ViewInstructionStore extends ComponentStore<object> {
  readonly connected$ = this._walletStore.connected$;
  readonly instruction$ = this._instructionStore.instruction$;
  readonly instructionBody$ = this.select(
    this._instructionStore.instruction$,
    (instruction) => instruction && instruction.data.body
  );
  readonly instructionArguments$ =
    this._instructionArgumentStore.instructionArguments$;

  readonly instructionContext$ = this.select(
    this.instruction$,
    this.instructionArguments$,
    this._instructionAccountStore.instructionAccounts$,
    this._instructionRelationStore.instructionRelations$,
    this._collectionStore.collections$,
    this._workspaceStore.workspaceId$,
    (
      instruction,
      instructionArguments,
      instructionAccounts,
      instructionRelations,
      collections,
      workspaceId
    ) =>
      instruction &&
      generateInstructionCode(
        instruction,
        instructionArguments,
        instructionAccounts,
        instructionRelations,
        collections.filter(({ data }) => data.workspace === workspaceId)
      )
  );
  readonly documents$ = this.select(
    this._instructionStore.instructionId$,
    this._instructionAccountStore.instructionAccounts$,
    this._instructionRelationStore.instructionRelations$,
    this._collectionStore.collections$,
    (instructionId, instructionAccounts, instructionRelations, collections) =>
      instructionAccounts
        .filter(
          ({ data }) => data.instruction === instructionId && data.kind.id === 0
        )
        .map((instructionAccount) => ({
          ...instructionAccount,
          relations: instructionRelations
            .filter(({ data }) => data.from === instructionAccount.id)
            .reduce(
              (
                relations: (Document<InstructionRelation> & {
                  to: Document<InstructionAccount>;
                })[],
                instructionRelation
              ) => {
                const toAccount = instructionAccounts.find(
                  ({ id }) => id === instructionRelation.data.to
                );

                return toAccount
                  ? [
                      ...relations,
                      {
                        ...instructionRelation,
                        to: toAccount,
                      },
                    ]
                  : relations;
              },
              []
            ),
          collection: collections.reduce(
            (found: Document<Collection> | null, collection) =>
              !found &&
              instructionAccount.data.kind.collection === collection.id
                ? collection
                : null,
            null
          ),
          payer: instructionAccounts.reduce(
            (found: Document<InstructionAccount> | null, payer) =>
              !found && instructionAccount.data.modifier?.payer === payer.id
                ? payer
                : null,
            null
          ),
          close: instructionAccounts.reduce(
            (found: Document<InstructionAccount> | null, close) =>
              !found && instructionAccount.data.modifier?.close === close.id
                ? close
                : null,
            null
          ),
        }))
  );
  readonly signers$ = this.select(
    this._instructionAccountStore.instructionAccounts$,
    this._instructionStore.instructionId$,
    (instructionAccounts, instructionId) =>
      instructionAccounts &&
      instructionAccounts.filter(
        ({ data }) => data.instruction === instructionId && data.kind.id === 1
      )
  );
  readonly commonEditorOptions = {
    language: 'rust',
    automaticLayout: true,
    fontSize: 16,
    wordWrap: true,
  };
  readonly contextEditorOptions$ = this._themeService.isDarkThemeEnabled$.pipe(
    map((isDarkThemeEnabled) => ({
      ...this.commonEditorOptions,
      theme: isDarkThemeEnabled ? 'vs-dark' : 'vs-light',
      readOnly: true,
    }))
  );
  readonly handlerEditorOptions$ = this._themeService.isDarkThemeEnabled$.pipe(
    map((isDarkThemeEnabled) => ({
      ...this.commonEditorOptions,
      theme: isDarkThemeEnabled ? 'vs-dark' : 'vs-light',
      readOnly: false,
    }))
  );

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _walletStore: WalletStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _instructionStore: InstructionStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _instructionAccountStore: InstructionAccountStore,
    private readonly _instructionArgumentStore: InstructionArgumentStore,
    private readonly _instructionRelationStore: InstructionRelationStore,
    private readonly _themeService: DarkThemeService,
    private readonly _matDialog: MatDialog,
    private readonly _tabStore: TabStore
  ) {
    super({});
  }

  readonly loadWorkspaceId$ = this.effect(() =>
    this._router.events.pipe(
      filter(
        (event): event is NavigationStart => event instanceof NavigationStart
      ),
      map((event) => event.url.split('/').filter((segment) => segment)[1]),
      startWith(this._route.snapshot.paramMap.get('workspaceId')),
      tap((workspaceId) => this._workspaceStore.setWorkspaceId(workspaceId))
    )
  );

  readonly loadApplicationId$ = this.effect(() =>
    this._router.events.pipe(
      filter(
        (event): event is NavigationStart => event instanceof NavigationStart
      ),
      map((event) => event.url.split('/').filter((segment) => segment)[3]),
      startWith(this._route.snapshot.paramMap.get('applicationId')),
      tap((applicationId) =>
        this._applicationStore.setApplicationId(applicationId)
      )
    )
  );

  readonly loadInstructionId$ = this.effect(() =>
    this._router.events.pipe(
      filter(
        (event): event is NavigationStart => event instanceof NavigationStart
      ),
      map((event) => event.url.split('/').filter((segment) => segment)[5]),
      startWith(this._route.snapshot.paramMap.get('instructionId')),
      tap((instructionId) =>
        this._instructionStore.setInstructionId(instructionId)
      )
    )
  );

  readonly openTab$ = this.effect(() =>
    combineLatest([
      this._router.events.pipe(
        filter(
          (event): event is NavigationStart => event instanceof NavigationStart
        ),
        map((event) => event.url),
        startWith(this._router.routerState.snapshot.url),
        map((url) => url.split('/').filter((segment) => segment)),
        filter(
          (urlAsArray) =>
            urlAsArray.length === 6 &&
            urlAsArray[0] === 'workspaces' &&
            urlAsArray[2] === 'applications' &&
            urlAsArray[4] === 'instructions'
        )
      ),
      this.instruction$.pipe(isNotNullOrUndefined),
    ]).pipe(
      tap(([, instruction]) =>
        this._tabStore.openTab({
          id: instruction.id,
          label: instruction.data.name,
          url: `/workspaces/${instruction.data.workspace}/applications/${instruction.data.application}/instructions/${instruction.id}`,
        })
      )
    )
  );

  readonly updateInstructionBody = this.effect(
    (
      request$: Observable<{
        instruction: Document<Instruction>;
        instructionBody: string;
      }>
    ) =>
      request$.pipe(
        tap(({ instruction, instructionBody }) =>
          this._instructionStore.updateInstructionBody({
            instruction,
            body: instructionBody,
          })
        )
      )
  );

  readonly createInstructionArgument = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        instructionId: string;
      }>
    ) =>
      request$.pipe(
        exhaustMap(({ workspaceId, applicationId, instructionId }) =>
          this._matDialog
            .open(EditArgumentComponent)
            .afterClosed()
            .pipe(
              isTruthy,
              tap((data) =>
                this._instructionArgumentStore.createInstructionArgument({
                  workspaceId,
                  applicationId,
                  instructionId,
                  data,
                })
              )
            )
        )
      )
  );

  readonly updateInstructionArgument = this.effect(
    (instructionArgument$: Observable<Document<InstructionArgument>>) =>
      instructionArgument$.pipe(
        exhaustMap((instructionArgument) =>
          this._matDialog
            .open(EditArgumentComponent, { data: { instructionArgument } })
            .afterClosed()
            .pipe(
              isTruthy,
              tap((changes) =>
                this._instructionArgumentStore.updateInstructionArgument({
                  instructionArgument,
                  changes,
                })
              )
            )
        )
      )
  );

  readonly deleteInstructionArgument = this.effect(
    (instructionArgument$: Observable<Document<InstructionArgument>>) =>
      instructionArgument$.pipe(
        tap((instructionArgument) =>
          this._instructionArgumentStore.deleteInstructionArgument(
            instructionArgument
          )
        )
      )
  );

  readonly createInstructionDocument = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        instructionId: string;
      }>
    ) =>
      request$.pipe(
        concatMap((request) =>
          of(request).pipe(
            withLatestFrom(
              this._collectionStore.collections$,
              this._instructionAccountStore.instructionAccounts$
            )
          )
        ),
        exhaustMap(
          ([
            { workspaceId, applicationId, instructionId },
            collections,
            instructionAccounts,
          ]) =>
            this._matDialog
              .open(EditDocumentComponent, {
                data: { collections, accounts: instructionAccounts },
              })
              .afterClosed()
              .pipe(
                isTruthy,
                tap((data) =>
                  this._instructionAccountStore.createInstructionAccount({
                    workspaceId,
                    applicationId,
                    instructionId,
                    data,
                  })
                )
              )
        )
      )
  );

  readonly updateInstructionDocument = this.effect(
    (instructionAccount$: Observable<Document<InstructionAccount>>) =>
      instructionAccount$.pipe(
        concatMap((instructionAccount) =>
          of(instructionAccount).pipe(
            withLatestFrom(
              this._collectionStore.collections$,
              this._instructionAccountStore.instructionAccounts$
            )
          )
        ),
        exhaustMap(([instructionAccount, collections, instructionAccounts]) =>
          this._matDialog
            .open(EditDocumentComponent, {
              data: {
                document: instructionAccount,
                collections,
                accounts: instructionAccounts.filter(
                  ({ id }) => id !== instructionAccount.id
                ),
              },
            })
            .afterClosed()
            .pipe(
              isTruthy,
              tap((changes) =>
                this._instructionAccountStore.updateInstructionAccount({
                  instructionAccount,
                  changes,
                })
              )
            )
        )
      )
  );

  readonly deleteInstructionDocument = this.effect(
    (instructionAccount$: Observable<Document<InstructionAccount>>) =>
      instructionAccount$.pipe(
        tap((instructionAccount) =>
          this._instructionAccountStore.deleteInstructionAccount(
            instructionAccount
          )
        )
      )
  );

  readonly createInstructionSigner = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        instructionId: string;
      }>
    ) =>
      request$.pipe(
        concatMap((request) =>
          of(request).pipe(
            withLatestFrom(
              this._collectionStore.collections$,
              this._instructionAccountStore.instructionAccounts$
            )
          )
        ),
        exhaustMap(
          ([
            { workspaceId, applicationId, instructionId },
            collections,
            instructionAccounts,
          ]) =>
            this._matDialog
              .open(EditSignerComponent, {
                data: { data: { collections, accounts: instructionAccounts } },
              })
              .afterClosed()
              .pipe(
                isTruthy,
                tap((data) =>
                  this._instructionAccountStore.createInstructionAccount({
                    workspaceId,
                    applicationId,
                    instructionId,
                    data,
                  })
                )
              )
        )
      )
  );

  readonly updateInstructionSigner = this.effect(
    (instructionAccount$: Observable<Document<InstructionAccount>>) =>
      instructionAccount$.pipe(
        concatMap((instructionAccount) =>
          of(instructionAccount).pipe(
            withLatestFrom(
              this._collectionStore.collections$,
              this._instructionAccountStore.instructionAccounts$
            )
          )
        ),
        exhaustMap(([instructionAccount, collections, instructionAccounts]) =>
          this._matDialog
            .open(EditSignerComponent, {
              data: {
                signer: instructionAccount,
                collections,
                accounts: instructionAccounts,
              },
            })
            .afterClosed()
            .pipe(
              isTruthy,
              tap((changes) =>
                this._instructionAccountStore.updateInstructionAccount({
                  instructionAccount,
                  changes,
                })
              )
            )
        )
      )
  );

  readonly deleteInstructionSigner = this.effect(
    (instructionAccount$: Observable<Document<InstructionAccount>>) =>
      instructionAccount$.pipe(
        tap((instructionAccount) =>
          this._instructionAccountStore.deleteInstructionAccount(
            instructionAccount
          )
        )
      )
  );

  readonly createInstructionRelation = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        instructionId: string;
        documentId: string;
      }>
    ) =>
      request$.pipe(
        concatMap((request) =>
          of(request).pipe(
            withLatestFrom(this._instructionAccountStore.instructionAccounts$)
          )
        ),
        exhaustMap(
          ([
            { workspaceId, applicationId, instructionId, documentId },
            instructionAccounts,
          ]) =>
            this._matDialog
              .open(EditRelationComponent, {
                data: {
                  accounts: instructionAccounts.filter(
                    ({ id }) => id !== documentId
                  ),
                  from: documentId,
                },
              })
              .afterClosed()
              .pipe(
                isTruthy,
                tap((data) =>
                  this._instructionRelationStore.createInstructionRelation({
                    workspaceId,
                    applicationId,
                    instructionId,
                    data,
                  })
                )
              )
        )
      )
  );

  readonly updateInstructionRelation = this.effect(
    (instructionRelation$: Observable<Document<InstructionRelation>>) =>
      instructionRelation$.pipe(
        concatMap((instructionRelation) =>
          of(instructionRelation).pipe(
            withLatestFrom(this._instructionAccountStore.instructionAccounts$)
          )
        ),
        exhaustMap(([instructionRelation, instructionAccounts]) =>
          this._matDialog
            .open(EditRelationComponent, {
              data: {
                relation: instructionRelation,
                accounts: instructionAccounts.filter(
                  ({ id }) => id !== instructionRelation.data.from
                ),
              },
            })
            .afterClosed()
            .pipe(
              isTruthy,
              tap((changes) =>
                this._instructionRelationStore.updateInstructionRelation({
                  instructionRelation,
                  changes,
                })
              )
            )
        )
      )
  );

  readonly deleteInstructionRelation = this.effect(
    (instructionRelation$: Observable<Document<InstructionRelation>>) =>
      instructionRelation$.pipe(
        tap((instructionRelation) =>
          this._instructionRelationStore.deleteInstructionRelation(
            instructionRelation
          )
        )
      )
  );
}
