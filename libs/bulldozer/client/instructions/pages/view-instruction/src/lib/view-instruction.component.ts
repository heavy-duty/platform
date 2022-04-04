import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InstructionStore } from '@bulldozer-client/instructions-data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { map } from 'rxjs';
import { ViewInstructionStore } from './view-instruction.store';

@Component({
  selector: 'bd-view-instruction',
  template: `
    <ng-container *ngIf="instruction$ | ngrxPush as instruction">
      <aside class="w-80 flex flex-col flex-shrink-0">
        <header class="py-5 px-7 border-b mb-0 w-full hd-border-gray">
          <p class="mb-0 text-xl uppercase">{{ instruction.document.name }}</p>
          <p class="text-xs">
            Visualize all the details about this instruction.
          </p>
        </header>

        <ul class="flex-1">
          <li>
            <a
              class="flex flex-col gap-1 border-l-4 py-5 px-7"
              [routerLink]="[
                '/workspaces',
                instruction.document.data.workspace,
                'applications',
                instruction.document.data.application,
                'instructions',
                instruction.document.id,
                'arguments'
              ]"
              [routerLinkActive]="[
                'bg-white',
                'bg-opacity-5',
                'border-primary'
              ]"
              [ngClass]="{
                'border-transparent': !isRouteActive(
                  '/workspaces/' +
                    instruction.document.data.workspace +
                    '/applications/' +
                    instruction.document.data.application +
                    '/instructions/' +
                    instruction.document.id +
                    '/arguments'
                )
              }"
            >
              <span class="text-lg font-bold">Arguments</span>
              <span class="text-xs font-thin">
                Visualize the list of arguments.
              </span>
            </a>
          </li>
          <li>
            <a
              class="flex flex-col gap-1 border-l-4 py-5 px-7"
              [routerLink]="[
                '/workspaces',
                instruction.document.data.workspace,
                'applications',
                instruction.document.data.application,
                'instructions',
                instruction.document.id,
                'documents'
              ]"
              [routerLinkActive]="[
                'bg-white',
                'bg-opacity-5',
                'border-primary'
              ]"
              [ngClass]="{
                'border-transparent': !isRouteActive(
                  '/workspaces/' +
                    instruction.document.data.workspace +
                    '/applications/' +
                    instruction.document.data.application +
                    '/instructions/' +
                    instruction.document.id +
                    '/documents'
                )
              }"
            >
              <span class="text-lg font-bold">Documents</span>
              <span class="text-xs font-thin">
                Visualize the list of documents.
              </span>
            </a>
          </li>
          <li>
            <a
              class="flex flex-col gap-1 border-l-4 py-5 px-7"
              [routerLink]="[
                '/workspaces',
                instruction.document.data.workspace,
                'applications',
                instruction.document.data.application,
                'instructions',
                instruction.document.id,
                'signers'
              ]"
              [routerLinkActive]="[
                'bg-white',
                'bg-opacity-5',
                'border-primary'
              ]"
              [ngClass]="{
                'border-transparent': !isRouteActive(
                  '/workspaces/' +
                    instruction.document.data.workspace +
                    '/applications/' +
                    instruction.document.data.application +
                    '/instructions/' +
                    instruction.document.id +
                    '/signers'
                )
              }"
            >
              <span class="text-lg font-bold">Signers</span>
              <span class="text-xs font-thin">
                Visualize the list of signers.
              </span>
            </a>
          </li>
          <li>
            <a
              class="flex flex-col gap-1 border-l-4 py-5 px-7"
              [routerLink]="[
                '/workspaces',
                instruction.document.data.workspace,
                'applications',
                instruction.document.data.application,
                'instructions',
                instruction.document.id,
                'code-editor'
              ]"
              [routerLinkActive]="[
                'bg-white',
                'bg-opacity-5',
                'border-primary'
              ]"
              [ngClass]="{
                'border-transparent': !isRouteActive(
                  '/workspaces/' +
                    instruction.document.data.workspace +
                    '/applications/' +
                    instruction.document.data.application +
                    '/instructions/' +
                    instruction.document.id +
                    '/code-editor'
                )
              }"
            >
              <span class="text-lg font-bold">Code Editor</span>
              <span class="text-xs font-thin"> Edit instruction code. </span>
            </a>
          </li>
        </ul>

        <footer
          class="sticky bottom-0 bd-bg-black py-5 px-7 w-full flex justify-center items-center gap-2 border-t border-white border-opacity-10 shadow-inner"
        >
          <button
            mat-stroked-button
            color="accent"
            bdEditInstruction
            [instruction]="instruction.document"
            (editInstruction)="
              onUpdateInstruction(
                instruction.document.data.workspace,
                instruction.document.data.application,
                instruction.document.id,
                $event
              )
            "
          >
            Edit
          </button>
          <button
            mat-stroked-button
            color="warn"
            (click)="
              onDeleteInstruction(
                instruction.document.data.workspace,
                instruction.document.data.application,
                instruction.document.id
              )
            "
          >
            Delete
          </button>
        </footer>
      </aside>

      <div class="flex-1">
        <router-outlet></router-outlet>
      </div>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [InstructionStore, ViewInstructionStore],
})
export class ViewInstructionComponent {
  @HostBinding('class') class = 'flex h-full';
  readonly connected$ = this._walletStore.connected$;
  readonly instruction$ = this._instructionStore.instruction$;

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _instructionStore: InstructionStore,
    private readonly _walletStore: WalletStore,
    private readonly _viewInstructionStore: ViewInstructionStore
  ) {
    this._viewInstructionStore.setWorkspaceId(
      this._route.paramMap.pipe(map((paramMap) => paramMap.get('workspaceId')))
    );
    this._viewInstructionStore.setApplicationId(
      this._route.paramMap.pipe(
        map((paramMap) => paramMap.get('applicationId'))
      )
    );
    this._viewInstructionStore.setInstructionId(
      this._route.paramMap.pipe(
        map((paramMap) => paramMap.get('instructionId'))
      )
    );
  }

  isRouteActive(url: string) {
    return this._router.isActive(url, {
      paths: 'exact',
      queryParams: 'exact',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  onUpdateInstruction(
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    instructionName: string
  ) {
    this._viewInstructionStore.updateInstruction({
      workspaceId,
      applicationId,
      instructionId,
      instructionName,
    });
  }

  onDeleteInstruction(
    workspaceId: string,
    applicationId: string,
    instructionId: string
  ) {
    this._viewInstructionStore.deleteInstruction({
      workspaceId,
      applicationId,
      instructionId,
    });
  }
}
