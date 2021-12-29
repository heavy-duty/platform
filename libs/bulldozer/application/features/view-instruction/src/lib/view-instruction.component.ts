import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import {
  Document,
  Instruction,
  InstructionAccount,
  InstructionArgument,
  InstructionRelation,
} from '@heavy-duty/bulldozer-devkit';
import {
  InstructionArgumentStore,
  InstructionDocumentStore,
  InstructionRelationStore,
  InstructionSignerStore,
  InstructionStore,
  WorkspaceStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { EditArgumentComponent } from '@heavy-duty/bulldozer/application/features/edit-argument';
import { EditDocumentComponent } from '@heavy-duty/bulldozer/application/features/edit-document';
import { EditRelationComponent } from '@heavy-duty/bulldozer/application/features/edit-relation';
import { EditSignerComponent } from '@heavy-duty/bulldozer/application/features/edit-signer';
import { DarkThemeService } from '@heavy-duty/bulldozer/application/utils/services/dark-theme';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { combineLatest, concatMap, filter, map, startWith, take } from 'rxjs';

@Component({
  selector: 'bd-view-instruction',
  template: `
    <div class="flex w-full" *ngIf="instruction$ | ngrxPush as instruction">
      <div class="p-4 w-1/2 bd-custom-height-layout overflow-auto">
        <header bdPageHeader>
          <h1>
            {{ instruction.data.name }}
            <button
              mat-icon-button
              color="primary"
              aria-label="Reload instruction"
              (click)="onReload()"
            >
              <mat-icon>refresh</mat-icon>
            </button>
          </h1>
          <p>Visualize all the details about this instruction.</p>
        </header>

        <bd-instruction-menu
          [connected]="connected$ | ngrxPush"
          (createArgument)="
            onCreateInstructionArgument(
              instruction.data.workspace,
              instruction.data.application,
              instruction.id
            )
          "
          (createDocument)="
            onCreateInstructionDocument(
              instruction.data.workspace,
              instruction.data.application,
              instruction.id
            )
          "
          (createSigner)="
            onCreateInstructionSigner(
              instruction.data.workspace,
              instruction.data.application,
              instruction.id
            )
          "
          (createRelation)="
            onCreateInstructionRelation(
              instruction.data.workspace,
              instruction.data.application,
              instruction.id
            )
          "
        >
        </bd-instruction-menu>

        <main>
          <bd-list-arguments
            class="block mb-4"
            [connected]="connected$ | ngrxPush"
            [arguments]="arguments$ | ngrxPush"
            (updateArgument)="onUpdateInstructionArgument($event)"
            (deleteArgument)="onDeleteInstructionArgument($event)"
          ></bd-list-arguments>

          <bd-list-documents
            class="block mb-4"
            [connected]="connected$ | ngrxPush"
            [documents]="documents$ | ngrxPush"
            (updateDocument)="onUpdateInstructionDocument($event)"
            (deleteDocument)="onDeleteInstructionDocument($event)"
            (updateRelation)="onUpdateInstructionRelation($event)"
            (deleteRelation)="onDeleteInstructionRelation($event)"
          >
          </bd-list-documents>

          <bd-list-signers
            class="block mb-16"
            [connected]="connected$ | ngrxPush"
            [signers]="signers$ | ngrxPush"
            (updateSigner)="onUpdateInstructionSigner($event)"
            (deleteSigner)="onDeleteInstructionSigner($event)"
          >
          </bd-list-signers>
        </main>
      </div>
      <div class="w-1/2">
        <div class="bd-custom-height-layout overflow-hidden">
          <bd-code-editor
            [customClass]="'bd-border-bottom bd-custom-monaco-editor-splited'"
            [template]="instructionContext$ | ngrxPush"
            [options]="contextEditorOptions$ | ngrxPush"
          ></bd-code-editor>

          <ng-container *ngIf="connected$ | ngrxPush">
            <div
              *ngIf="instruction.data.body !== instructionBody"
              class="w-full flex justify-end"
            >
              <p class="ml-2 mb-0">
                Remember to save the changes below:
                <button
                  mat-raised-button
                  color="primary"
                  (click)="onUpdateInstructionBody(instruction)"
                >
                  Save
                </button>
              </p>
            </div>
          </ng-container>

          <bd-code-editor
            [customClass]="'bd-custom-monaco-editor-splited'"
            [template]="instructionBody$ | ngrxPush"
            [options]="handlerEditorOptions$ | ngrxPush"
            (codeChange)="instructionBody = $event"
          ></bd-code-editor>
        </div>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewInstructionComponent implements OnInit {
  @HostBinding('class') class = 'block';
  instructionBody = '';
  readonly connected$ = this._walletStore.connected$;
  readonly instruction$ = this._instructionStore.instruction$;
  readonly instructionBody$ = this._instructionStore.instructionBody$;
  readonly instructionContext$ = this._instructionStore.instructionContext$;
  readonly arguments$ = this._instructionStore.instructionArguments$;
  readonly accounts$ = this._instructionStore.instructionAccounts$;
  readonly documents$ = this._instructionDocumentStore.documents$;
  readonly signers$ = this._instructionSignerStore.signers$;

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
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _instructionStore: InstructionStore,
    private readonly _instructionDocumentStore: InstructionDocumentStore,
    private readonly _instructionSignerStore: InstructionSignerStore,
    private readonly _instructionArgumentStore: InstructionArgumentStore,
    private readonly _instructionRelationStore: InstructionRelationStore,
    private readonly _themeService: DarkThemeService,
    private readonly _matDialog: MatDialog
  ) {}

  ngOnInit() {
    this._instructionStore.instruction$
      .pipe(take(1))
      .subscribe(
        (instruction) => (this.instructionBody = instruction?.data.body || '')
      );

    this._instructionStore.selectInstruction(
      this._router.events.pipe(
        filter(
          (event): event is NavigationStart => event instanceof NavigationStart
        ),
        map((event) => {
          const urlAsArray = event.url.split('/').filter((segment) => segment);

          if (urlAsArray.length !== 6 || urlAsArray[4] !== 'instructions') {
            return null;
          } else {
            return urlAsArray[5];
          }
        }),
        startWith(this._route.snapshot.paramMap.get('instructionId') || null)
      )
    );
  }

  onReload() {
    // this._instructionStore.reload();
  }

  onUpdateInstructionBody(instruction: Document<Instruction>) {
    this._instructionStore.updateInstructionBody({
      instruction,
      body: this.instructionBody,
    });
  }

  onCreateInstructionArgument(
    workspaceId: string,
    applicationId: string,
    instructionId: string
  ) {
    this._instructionArgumentStore.createInstructionArgument(
      this._matDialog
        .open(EditArgumentComponent)
        .afterClosed()
        .pipe(
          filter((data) => data),
          map((data) => ({ workspaceId, applicationId, instructionId, data }))
        )
    );
  }

  onUpdateInstructionArgument(
    instructionArgument: Document<InstructionArgument>
  ) {
    this._instructionArgumentStore.updateInstructionArgument(
      this._matDialog
        .open(EditArgumentComponent)
        .afterClosed()
        .pipe(
          filter((changes) => changes),
          map((changes) => ({ instructionArgument, changes }))
        )
    );
  }

  onDeleteInstructionArgument(instructionArgumentId: string) {
    this._instructionArgumentStore.deleteInstructionArgument(
      instructionArgumentId
    );
  }

  onCreateInstructionDocument(
    workspaceId: string,
    applicationId: string,
    instructionId: string
  ) {
    this._instructionDocumentStore.createInstructionDocument(
      combineLatest([
        this._workspaceStore.collections$,
        this._instructionStore.instructionAccounts$,
      ]).pipe(
        concatMap(([collections, instructionAccounts]) =>
          this._matDialog
            .open(EditDocumentComponent, {
              data: { data: { collections, accounts: instructionAccounts } },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              map((data) => ({
                workspaceId,
                applicationId,
                instructionId,
                data,
              }))
            )
        )
      )
    );
  }

  onUpdateInstructionDocument(
    instructionDocument: Document<InstructionAccount>
  ) {
    this._instructionDocumentStore.updateInstructionDocument(
      combineLatest([
        this._workspaceStore.collections$,
        this._instructionStore.instructionAccounts$,
      ]).pipe(
        concatMap(([collections, instructionAccounts]) =>
          this._matDialog
            .open(EditDocumentComponent, {
              data: { data: { collections, accounts: instructionAccounts } },
            })
            .afterClosed()
            .pipe(
              filter((changes) => changes),
              map((changes) => ({
                instructionDocument,
                changes,
              }))
            )
        )
      )
    );
  }

  onDeleteInstructionDocument(instructionDocumentId: string) {
    this._instructionDocumentStore.deleteInstructionDocument(
      instructionDocumentId
    );
  }

  onCreateInstructionSigner(
    workspaceId: string,
    applicationId: string,
    instructionId: string
  ) {
    this._instructionSignerStore.createInstructionSigner(
      this._matDialog
        .open(EditSignerComponent)
        .afterClosed()
        .pipe(
          filter((data) => data),
          map((data) => ({
            workspaceId,
            applicationId,
            instructionId,
            data,
          }))
        )
    );
  }

  onUpdateInstructionSigner(instructionSigner: Document<InstructionAccount>) {
    this._instructionSignerStore.updateInstructionSigner(
      this._matDialog
        .open(EditSignerComponent)
        .afterClosed()
        .pipe(
          filter((changes) => changes),
          map((changes) => ({
            instructionSigner,
            changes,
          }))
        )
    );
  }

  onDeleteInstructionSigner(instructionSignerId: string) {
    this._instructionSignerStore.deleteInstructionSigner(instructionSignerId);
  }

  onCreateInstructionRelation(
    workspaceId: string,
    applicationId: string,
    instructionId: string
  ) {
    this._instructionRelationStore.createInstructionRelation(
      this._instructionStore.instructionAccounts$.pipe(
        concatMap(([instructionAccounts]) =>
          this._matDialog
            .open(EditRelationComponent, {
              data: { data: { accounts: instructionAccounts } },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              map((data) => ({
                workspaceId,
                applicationId,
                instructionId,
                data,
              }))
            )
        )
      )
    );
  }

  onUpdateInstructionRelation(
    instructionRelation: Document<InstructionRelation>
  ) {
    this._instructionRelationStore.updateInstructionRelation(
      this._instructionStore.instructionAccounts$.pipe(
        concatMap(([instructionAccounts]) =>
          this._matDialog
            .open(EditRelationComponent, {
              data: { data: { accounts: instructionAccounts } },
            })
            .afterClosed()
            .pipe(
              filter((changes) => changes),
              map((changes) => ({
                instructionRelation,
                changes,
              }))
            )
        )
      )
    );
  }

  onDeleteInstructionRelation(relationId: string) {
    this._instructionRelationStore.deleteInstructionRelation(relationId);
  }
}
