import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { InstructionStore } from '@heavy-duty/bulldozer/application/data-access';
import { DarkThemeService } from '@heavy-duty/bulldozer/application/ui/dark-theme';
import {
  InstructionAccountExtended,
  InstructionArgument,
  InstructionRelationExtended,
} from '@heavy-duty/bulldozer/application/utils/types';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'bd-view-instruction',
  template: `
    <div class="flex w-full">
      <div class="p-4 w-1/2 bd-custom-height-layout overflow-auto">
        <header bdPageHeader *ngIf="instruction$ | ngrxPush as instruction">
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
          (createArgument)="onCreateArgument()"
          (createDocument)="onCreateDocument()"
          (createSigner)="onCreateSigner()"
          (createRelation)="onCreateRelation()"
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

          <div *ngIf="connected$ | ngrxPush" class="w-full flex justify-end">
            <p class="ml-2 mb-0">
              Remember to save the changes below:
              <button
                mat-raised-button
                color="primary"
                (click)="onSaveInstructionBody()"
              >
                Save
              </button>
            </p>
          </div>

          <bd-code-editor
            [customClass]="'bd-custom-monaco-editor-splited'"
            [template]="instructionBody$ | ngrxPush"
            [options]="handlerEditorOptions$ | ngrxPush"
            (codeChange)="onUpdateInstructionBody($event)"
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
  readonly connected$ = this._walletStore.connected$;
  readonly instruction$ = this._instructionStore.instruction$;
  readonly instructionBody$ = this._instructionStore.instructionBody$;
  readonly instructionContext$ = this._instructionStore.instructionContext$;
  readonly arguments$ = this._instructionStore.instructionArguments$;
  readonly accounts$ = this._instructionStore.instructionAccounts$;
  readonly documents$ = this._instructionStore.documents$;
  readonly signers$ = this._instructionStore.signers$;

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
    private readonly _instructionStore: InstructionStore,
    private readonly _themeService: DarkThemeService
  ) {}

  ngOnInit() {
    this._instructionStore.selectInstruction(
      this._router.events.pipe(
        filter(
          (event): event is NavigationStart => event instanceof NavigationStart
        ),
        map((event) => {
          const urlAsArray = event.url.split('/').filter((segment) => segment);

          if (urlAsArray.length !== 4 || urlAsArray[2] !== 'instructions') {
            return null;
          } else {
            return urlAsArray[3];
          }
        }),
        startWith(this._route.snapshot.paramMap.get('instructionId') || null)
      )
    );
  }

  onReload() {
    this._instructionStore.reload();
  }

  onUpdateInstructionBody(body: string) {
    this._instructionStore.updateInstructionBody(body);
  }

  onSaveInstructionBody() {
    this._instructionStore.saveInstructionBody();
  }

  onCreateArgument() {
    this._instructionStore.createArgument();
  }

  onUpdateArgument(argument: InstructionArgument) {
    this._instructionStore.updateArgument(argument);
  }

  onDeleteArgument(argumentId: string) {
    this._instructionStore.deleteArgument(argumentId);
  }

  onCreateDocument() {
    this._instructionStore.createDocument();
  }

  onUpdateDocument(account: InstructionAccountExtended) {
    this._instructionStore.updateDocument(account);
  }

  onCreateSigner() {
    this._instructionStore.createSigner();
  }

  onUpdateSigner(account: InstructionAccountExtended) {
    this._instructionStore.updateSigner(account);
  }

  onDeleteAccount(accountId: string) {
    this._instructionStore.deleteAccount(accountId);
  }

  onCreateRelation() {
    this._instructionStore.createRelation();
  }

  onUpdateRelation(relation: InstructionRelationExtended) {
    this._instructionStore.updateRelation(relation);
  }

  onDeleteRelation(relationId: string) {
    this._instructionStore.deleteRelation(relationId);
  }
}
