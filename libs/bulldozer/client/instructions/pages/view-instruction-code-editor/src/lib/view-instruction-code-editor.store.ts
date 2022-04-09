import { Injectable } from '@angular/core';
import { CodeEditorOptions } from '@bulldozer-client/code-editor';
import { CollectionsStore } from '@bulldozer-client/collections-data-access';
import { DarkThemeStore } from '@bulldozer-client/core-data-access';
import {
  InstructionAccountQueryStore,
  InstructionAccountsStore,
  InstructionApiService,
  InstructionArgumentQueryStore,
  InstructionArgumentsStore,
  InstructionRelationQueryStore,
  InstructionRelationsStore,
  InstructionStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  InstructionStatus,
  WorkspaceInstructionsStore,
} from '@bulldozer-client/workspaces-data-access';
import {
  Collection,
  Document,
  Instruction,
  InstructionAccount,
  InstructionArgument,
  InstructionRelation,
  Relation,
} from '@heavy-duty/bulldozer-devkit';
import { generateInstructionCode } from '@heavy-duty/generator';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  filter,
  map,
  of,
  pipe,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';

const COMMON_EDITOR_OPTIONS: CodeEditorOptions = {
  language: 'rust',
  automaticLayout: true,
  fontSize: 16,
  wordWrap: 'on',
  theme: 'vs-light',
  readOnly: false,
};

interface ViewModel {
  contextCode: string | null;
  contextEditorOptions: CodeEditorOptions;
  handleCode: string | null;
  handleEditorOptions: CodeEditorOptions;
  instructionId: string | null;
}

const initialState: ViewModel = {
  contextCode: null,
  contextEditorOptions: {
    ...COMMON_EDITOR_OPTIONS,
    readOnly: true,
  },
  handleCode: null,
  handleEditorOptions: COMMON_EDITOR_OPTIONS,
  instructionId: null,
};

@Injectable()
export class ViewInstructionCodeEditorStore extends ComponentStore<ViewModel> {
  readonly contextCode$ = this.select(({ contextCode }) => contextCode);
  readonly contextEditorOptions$ = this.select(
    ({ contextEditorOptions }) => contextEditorOptions
  );
  readonly handleCode$ = this.select(({ handleCode }) => handleCode);
  readonly handleEditorOptions$ = this.select(
    ({ handleEditorOptions }) => handleEditorOptions
  );
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _instructionApiService: InstructionApiService,
    private readonly _instructionStore: InstructionStore,
    private readonly _instructionArgumentQueryStore: InstructionArgumentQueryStore,
    private readonly _instructionArgumentsStore: InstructionArgumentsStore,
    private readonly _instructionAccountQueryStore: InstructionAccountQueryStore,
    private readonly _instructionAccountsStore: InstructionAccountsStore,
    private readonly _instructionRelationQueryStore: InstructionRelationQueryStore,
    private readonly _instructionRelationsStore: InstructionRelationsStore,
    private readonly _collectionsStore: CollectionsStore,
    darkThemeStore: DarkThemeStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._loadContextCode(
      this.select(
        this._instructionStore.instruction$,
        this._instructionArgumentsStore.instructionArguments$,
        this._instructionAccountsStore.instructionAccounts$,
        this._instructionRelationsStore.instructionRelations$,
        this._collectionsStore.collections$,
        (
          instruction,
          instructionArguments,
          instructionAccounts,
          instructionRelations,
          collections
        ) => ({
          instruction: instruction?.document ?? null,
          instructionArguments: instructionArguments ?? [],
          instructionAccounts: instructionAccounts.map(
            ({ document }) => document
          ),
          instructionRelations: instructionRelations.map(
            ({ document }) => document
          ),
          collections: collections.map(({ document }) => document),
        }),
        { debounce: true }
      )
    );
    this._loadEditorOptions(darkThemeStore.isDarkThemeEnabled$);
    this._loadHandleCode(
      this.select(
        this._instructionStore.instruction$,
        (instruction) => instruction?.document.data.body ?? null
      )
    );
    this._instructionArgumentQueryStore.setFilters(
      this.instructionId$.pipe(
        isNotNullOrUndefined,
        map((instruction) => ({ instruction }))
      )
    );
    this._instructionArgumentsStore.setFilters(
      this.instructionId$.pipe(
        isNotNullOrUndefined,
        map((instruction) => ({ instruction }))
      )
    );
    this._instructionAccountQueryStore.setFilters(
      this.instructionId$.pipe(
        isNotNullOrUndefined,
        map((instruction) => ({ instruction }))
      )
    );
    this._instructionAccountsStore.setInstructionAccountIds(
      this._instructionAccountQueryStore.instructionAccountIds$
    );
    this._instructionRelationQueryStore.setFilters(
      this.instructionId$.pipe(
        isNotNullOrUndefined,
        map((instruction) => ({ instruction }))
      )
    );
    this._instructionRelationsStore.setInstructionRelationIds(
      this._instructionRelationQueryStore.instructionRelationIds$
    );
    this._collectionsStore.setCollectionIds(
      this._instructionAccountsStore.instructionAccounts$.pipe(
        map((instructionAccounts) => [
          ...new Set(
            ...instructionAccounts
              .filter(
                (instructionAccount) =>
                  instructionAccount.document.data.kind.id === 1
              )
              .map(
                (instructionAccount) =>
                  instructionAccount.document.data.kind.collection
              )
              .filter(
                (collectionId): collectionId is string => collectionId !== null
              )
          ),
        ])
      )
    );
    this._handleInstruction(
      this.instructionId$.pipe(
        isNotNullOrUndefined,
        switchMap((instructionId) =>
          workspaceInstructionsStore.instruction$.pipe(
            filter((instruction) =>
              instruction.accounts.some(
                (account) =>
                  account.name === 'Instruction' &&
                  account.pubkey === instructionId
              )
            )
          )
        )
      )
    );
    this._handleCollectionUpdate(
      this._instructionAccountsStore.instructionAccounts$.pipe(
        map((instructionAccounts) =>
          [
            ...new Set([
              ...instructionAccounts
                .filter(
                  (instructionAccount) =>
                    instructionAccount.document.data.kind.id === 1
                )
                .map(
                  (instructionAccount) =>
                    instructionAccount.document.data.kind.collection
                ),
            ]),
          ].filter(
            (collectionId): collectionId is string => collectionId !== null
          )
        ),
        isNotNullOrUndefined,
        switchMap((collectionIds) =>
          workspaceInstructionsStore.instruction$.pipe(
            filter((instruction) =>
              instruction.accounts.some(
                (account) =>
                  account.name === 'Collection' &&
                  collectionIds.some(
                    (collectionId) => account.pubkey === collectionId
                  )
              )
            )
          )
        )
      )
    );
  }

  readonly setInstructionId = this.updater<string | null>(
    (state, instructionId) => ({ ...state, instructionId })
  );

  private readonly _loadEditorOptions = this.updater<boolean>(
    (state, isDarkThemeEnabled) => ({
      ...state,
      contextEditorOptions: {
        ...COMMON_EDITOR_OPTIONS,
        theme: isDarkThemeEnabled ? 'vs-dark' : 'vs-light',
        readOnly: true,
      },
      handleEditorOptions: {
        ...COMMON_EDITOR_OPTIONS,
        theme: isDarkThemeEnabled ? 'vs-dark' : 'vs-light',
        readOnly: false,
      },
    })
  );

  private readonly _loadHandleCode = this.updater<string | null>(
    (state, handleCode) => ({ ...state, handleCode })
  );

  private readonly _loadContextCode = this.updater<{
    instruction: Document<Instruction> | null;
    instructionArguments: Document<InstructionArgument>[];
    instructionAccounts: Document<InstructionAccount>[];
    instructionRelations: Relation<InstructionRelation>[];
    collections: Document<Collection>[];
  }>(
    (
      state,
      {
        instruction,
        instructionArguments,
        instructionAccounts,
        instructionRelations,
        collections,
      }
    ) => ({
      ...state,
      contextCode:
        instruction &&
        generateInstructionCode(
          instruction,
          instructionArguments,
          instructionAccounts,
          instructionRelations,
          collections
        ),
    })
  );

  private readonly _handleInstruction = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        case 'createInstruction':
        case 'updateInstruction':
        case 'updateInstructionBody':
        case 'deleteInstruction': {
          this._instructionStore.dispatch(instructionStatus);
          break;
        }
        case 'createInstructionAccount':
        case 'updateInstructionAccount':
        case 'deleteInstructionAccount': {
          this._instructionAccountsStore.dispatch(instructionStatus);
          break;
        }
        case 'createInstructionRelation':
        case 'deleteInstructionRelation': {
          this._instructionRelationsStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
  );

  private readonly _handleCollectionUpdate = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        case 'updateCollection': {
          this._collectionsStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
  );

  readonly updateInstructionBody = this.effect<{
    workspaceId: string;
    applicationId: string;
    instructionId: string;
    instructionBody: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          { workspaceId, applicationId, instructionId, instructionBody },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionApiService
            .updateBody({
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
              instructionId,
              instructionBody,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent('Update body request sent'),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );
}
