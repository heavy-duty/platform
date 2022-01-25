import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Collection,
  Document,
  InstructionAccount,
  InstructionRelation,
  Relation,
} from '@heavy-duty/bulldozer-devkit';
import {
  CollectionStore,
  InstructionAccountStore,
  InstructionRelationStore,
} from '@heavy-duty/bulldozer-store';
import { RouteStore } from '@heavy-duty/bulldozer/application/data-access';
import { EditDocumentComponent } from '@heavy-duty/bulldozer/application/features/edit-document';
import { EditRelationComponent } from '@heavy-duty/bulldozer/application/features/edit-relation';
import { isTruthy } from '@heavy-duty/rx-solana';
import { ComponentStore } from '@ngrx/component-store';
import { exhaustMap, Observable, tap } from 'rxjs';

@Injectable()
export class InstructionDocumentsListStore extends ComponentStore<object> {
  readonly instructionDocuments$ = this.select(
    this._routeStore.instructionId$,
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
            .filter(({ from }) => from === instructionAccount.id)
            .reduce(
              (
                relations: (Relation<InstructionRelation> & {
                  extras: { to: Document<InstructionAccount> };
                })[],
                instructionRelation
              ) => {
                const toAccount = instructionAccounts.find(
                  ({ id }) => id === instructionRelation.to
                );

                return toAccount
                  ? [
                      ...relations,
                      {
                        ...instructionRelation,
                        extras: { to: toAccount },
                      },
                    ]
                  : relations;
              },
              []
            ),
          collection:
            collections.find(
              (collection) =>
                instructionAccount.data.kind.collection === collection.id
            ) || null,
          payer:
            instructionAccounts.find(
              (payer) => instructionAccount.data.modifier?.payer === payer.id
            ) || null,
          close:
            instructionAccounts.find(
              (close) => instructionAccount.data.modifier?.close === close.id
            ) || null,
        }))
  );

  constructor(
    private readonly _collectionStore: CollectionStore,
    private readonly _instructionAccountStore: InstructionAccountStore,
    private readonly _instructionRelationStore: InstructionRelationStore,
    private readonly _matDialog: MatDialog,
    private readonly _routeStore: RouteStore
  ) {
    super({});
  }

  readonly createInstructionDocument = this.effect(
    (
      $: Observable<{
        applicationId: string;
        instructionId: string;
        collections: Document<Collection>[];
        instructionAccounts: Document<InstructionAccount>[];
      }>
    ) =>
      $.pipe(
        exhaustMap(
          ({
            applicationId,
            instructionId,
            instructionAccounts,
            collections,
          }) =>
            this._matDialog
              .open(EditDocumentComponent, {
                data: {
                  accounts: instructionAccounts,
                  collections,
                },
              })
              .afterClosed()
              .pipe(
                isTruthy,
                tap((data) =>
                  this._instructionAccountStore.createInstructionAccount({
                    applicationId,
                    instructionId,
                    instructionAccountDto: data,
                  })
                )
              )
        )
      )
  );

  readonly updateInstructionDocument = this.effect(
    (
      $: Observable<{
        instructionAccount: Document<InstructionAccount>;
        collections: Document<Collection>[];
        instructionAccounts: Document<InstructionAccount>[];
      }>
    ) =>
      $.pipe(
        exhaustMap(({ instructionAccount, instructionAccounts, collections }) =>
          this._matDialog
            .open(EditDocumentComponent, {
              data: {
                document: instructionAccount,
                accounts: instructionAccounts,
                collections,
              },
            })
            .afterClosed()
            .pipe(
              isTruthy,
              tap((changes) =>
                this._instructionAccountStore.updateInstructionAccount({
                  instructionAccountId: instructionAccount.id,
                  instructionAccountDto: changes,
                })
              )
            )
        )
      )
  );

  readonly deleteInstructionDocument = this.effect(
    (
      $: Observable<{
        instructionAccount: Document<InstructionAccount>;
      }>
    ) =>
      $.pipe(
        tap(({ instructionAccount }) =>
          this._instructionAccountStore.deleteInstructionAccount({
            instructionAccountId: instructionAccount.id,
            instructionId: instructionAccount.data.instruction,
          })
        )
      )
  );

  readonly createInstructionRelation = this.effect(
    (
      $: Observable<{
        applicationId: string;
        instructionId: string;
        documentId: string;
        instructionAccounts: Document<InstructionAccount>[];
      }>
    ) =>
      $.pipe(
        exhaustMap(
          ({ documentId, applicationId, instructionId, instructionAccounts }) =>
            this._matDialog
              .open(EditRelationComponent, {
                data: {
                  accounts: instructionAccounts.filter(
                    (instructionAccount) =>
                      instructionAccount.id !== documentId &&
                      instructionAccount.data.instruction === instructionId
                  ),
                  from: documentId,
                },
              })
              .afterClosed()
              .pipe(
                isTruthy,
                tap(({ to, from }) =>
                  this._instructionRelationStore.createInstructionRelation({
                    applicationId,
                    instructionId,
                    to,
                    from,
                  })
                )
              )
        )
      )
  );

  readonly updateInstructionRelation = this.effect(
    (
      $: Observable<{
        instructionRelation: Relation<InstructionRelation>;
        instructionAccounts: Document<InstructionAccount>[];
      }>
    ) =>
      $.pipe(
        exhaustMap(({ instructionRelation, instructionAccounts }) =>
          this._matDialog
            .open(EditRelationComponent, {
              data: {
                relation: instructionRelation,
                accounts: instructionAccounts,
              },
            })
            .afterClosed()
            .pipe(
              isTruthy,
              tap(({ to, from }) =>
                this._instructionRelationStore.updateInstructionRelation({
                  instructionRelationId: instructionRelation.id,
                  to,
                  from,
                })
              )
            )
        )
      )
  );

  readonly deleteInstructionRelation = this.effect(
    (
      $: Observable<{
        instructionRelation: Relation<InstructionRelation>;
      }>
    ) =>
      $.pipe(
        tap(({ instructionRelation }) =>
          this._instructionRelationStore.deleteInstructionRelation({
            instructionRelationId: instructionRelation.id,
            from: instructionRelation.from,
            to: instructionRelation.to,
          })
        )
      )
  );
}
