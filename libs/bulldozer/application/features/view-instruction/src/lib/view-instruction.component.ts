import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import {
  InstructionStore,
  TabsStore,
} from '@heavy-duty/bulldozer/application/data-access';
import {
  InstructionArgument,
  InstructionBasicAccount,
  InstructionProgramAccount,
  InstructionSignerAccount,
} from '@heavy-duty/bulldozer/data-access';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'bd-view-instruction',
  template: `
    <div class="flex">
      <div class="p-4 w-2/4">
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
          (createBasicAccount)="onCreateBasicAccount()"
          (createSignerAccount)="onCreateSignerAccount()"
          (createProgramAccount)="onCreateProgramAccount()"
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

          <bd-list-accounts
            class="block mb-16"
            [connected]="connected$ | ngrxPush"
            [accountsCount]="accountsCount$ | ngrxPush"
            [basicAccounts]="basicAccounts$ | ngrxPush"
            [signerAccounts]="signerAccounts$ | ngrxPush"
            [programAccounts]="programAccounts$ | ngrxPush"
            (updateBasicAccount)="onUpdateBasicAccount($event)"
            (deleteBasicAccount)="onDeleteBasicAccount($event)"
            (updateSignerAccount)="onUpdateSignerAccount($event)"
            (deleteSignerAccount)="onDeleteSignerAccount($event)"
            (updateProgramAccount)="onUpdateProgramAccount($event)"
            (deleteProgramAccount)="onDeleteProgramAccount($event)"
          >
          </bd-list-accounts>
        </main>
      </div>
      <div class="w-2/4">
        <bd-code-editor
          [customClass]="'custom-monaco-editor-splited'"
          [template]="rustCodeInstruction$ | ngrxPush"
          [readOnly]="true"
        ></bd-code-editor>
        <bd-code-editor
          [customClass]="'custom-monaco-editor-splited'"
          [template]="'AQUI EDITAS TU'"
        ></bd-code-editor>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewInstructionComponent implements OnInit {
  @HostBinding('class') class = 'block';
  readonly connected$ = this._walletStore.connected$;
  readonly instruction$ = this._tabsStore.tab$;
  readonly arguments$ = this._instructionStore.arguments$;
  readonly basicAccounts$ = this._instructionStore.basicAccounts$;
  readonly signerAccounts$ = this._instructionStore.signerAccounts$;
  readonly programAccounts$ = this._instructionStore.programAccounts$;
  readonly accountsCount$ = this._instructionStore.accountsCount$;
  readonly rustCodeInstruction$ = this._instructionStore.rustCode$;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _tabsStore: TabsStore,
    private readonly _walletStore: WalletStore,
    private readonly _instructionStore: InstructionStore
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

  onCreateArgument() {
    this._instructionStore.createArgument();
  }

  onUpdateArgument(argument: InstructionArgument) {
    this._instructionStore.updateArgument(argument);
  }

  onDeleteArgument(argumentId: string) {
    this._instructionStore.deleteArgument(argumentId);
  }

  onCreateBasicAccount() {
    this._instructionStore.createBasicAccount();
  }

  onUpdateBasicAccount(account: InstructionBasicAccount) {
    this._instructionStore.updateBasicAccount(account);
  }

  onDeleteBasicAccount(accountId: string) {
    this._instructionStore.deleteBasicAccount(accountId);
  }

  onCreateSignerAccount() {
    this._instructionStore.createSignerAccount();
  }

  onUpdateSignerAccount(account: InstructionSignerAccount) {
    this._instructionStore.updateSignerAccount(account);
  }

  onDeleteSignerAccount(accountId: string) {
    this._instructionStore.deleteSignerAccount(accountId);
  }

  onCreateProgramAccount() {
    this._instructionStore.createProgramAccount();
  }

  onUpdateProgramAccount(account: InstructionProgramAccount) {
    this._instructionStore.updateProgramAccount(account);
  }

  onDeleteProgramAccount(accountId: string) {
    this._instructionStore.deleteProgramAccount(accountId);
  }
}
