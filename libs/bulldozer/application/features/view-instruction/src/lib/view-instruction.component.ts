import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
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
import { DarkThemeService } from '@heavy-duty/bulldozer/application/utils/services/dark-theme';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { combineLatest, filter, map, startWith, take } from 'rxjs';

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
            onCreateArgument(
              instruction.data.workspace,
              instruction.data.application,
              instruction.id
            )
          "
          (createDocument)="
            onCreateDocument(
              instruction.data.workspace,
              instruction.data.application,
              instruction.id
            )
          "
          (createSigner)="
            onCreateSigner(
              instruction.data.workspace,
              instruction.data.application,
              instruction.id
            )
          "
          (createRelation)="
            onCreateRelation(
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
            (updateArgument)="onUpdateArgument($event)"
            (deleteArgument)="onDeleteArgument($event)"
          ></bd-list-arguments>

          <bd-list-documents
            class="block mb-4"
            [connected]="connected$ | ngrxPush"
            [documents]="documents$ | ngrxPush"
            (updateDocument)="onUpdateDocument($event)"
            (deleteDocument)="onDeleteAccount($event)"
            (updateRelation)="onUpdateRelation($event)"
            (deleteRelation)="onDeleteRelation($event)"
          >
          </bd-list-documents>

          <bd-list-signers
            class="block mb-16"
            [connected]="connected$ | ngrxPush"
            [signers]="signers$ | ngrxPush"
            (updateSigner)="onUpdateSigner($event)"
            (deleteSigner)="onDeleteAccount($event)"
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
    private readonly _themeService: DarkThemeService
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

  onCreateArgument(
    workspaceId: string,
    applicationId: string,
    instructionId: string
  ) {
    this._instructionArgumentStore.createArgument({
      workspaceId,
      applicationId,
      instructionId,
    });
  }

  onUpdateArgument(argument: Document<InstructionArgument>) {
    this._instructionArgumentStore.updateArgument(argument);
  }

  onDeleteArgument(argumentId: string) {
    this._instructionArgumentStore.deleteArgument(argumentId);
  }

  onCreateDocument(
    workspaceId: string,
    applicationId: string,
    instructionId: string
  ) {
    this._instructionDocumentStore.createDocument(
      combineLatest([
        this._workspaceStore.collections$,
        this._instructionStore.instructionAccounts$,
      ]).pipe(
        map(([collections, instructionAccounts]) => ({
          collections,
          instructionAccounts,
          workspaceId,
          applicationId,
          instructionId,
        }))
      )
    );
  }

  onUpdateDocument(document: Document<InstructionAccount>) {
    this._instructionDocumentStore.updateDocument(
      combineLatest([
        this._workspaceStore.collections$,
        this._instructionStore.instructionAccounts$,
      ]).pipe(
        map(([collections, instructionAccounts]) => ({
          collections,
          instructionAccounts,
          document,
        }))
      )
    );
  }

  onCreateSigner(
    workspaceId: string,
    applicationId: string,
    instructionId: string
  ) {
    this._instructionSignerStore.createSigner({
      workspaceId,
      applicationId,
      instructionId,
    });
  }

  onUpdateSigner(signer: Document<InstructionAccount>) {
    this._instructionSignerStore.updateSigner(signer);
  }

  onDeleteAccount(signerId: string) {
    this._instructionSignerStore.deleteSigner(signerId);
  }

  onCreateRelation(
    workspaceId: string,
    applicationId: string,
    instructionId: string
  ) {
    this._instructionRelationStore.createRelation(
      this._instructionStore.instructionAccounts$.pipe(
        map((instructionAccounts) => ({
          instructionAccounts,
          workspaceId,
          applicationId,
          instructionId,
        }))
      )
    );
  }

  onUpdateRelation(relation: Document<InstructionRelation>) {
    this._instructionRelationStore.updateRelation(
      this._instructionStore.instructionAccounts$.pipe(
        map((instructionAccounts) => ({
          instructionAccounts,
          relation,
        }))
      )
    );
  }

  onDeleteRelation(relationId: string) {
    this._instructionRelationStore.deleteRelation(relationId);
  }
}
