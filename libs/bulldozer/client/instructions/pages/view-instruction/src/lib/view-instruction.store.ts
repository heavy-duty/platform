import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DarkThemeService } from '@bulldozer-client/dark-theme-service';
import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
import {
  CollectionStore,
  InstructionAccountStore,
  InstructionArgumentStore,
  InstructionRelationStore,
  InstructionStore,
} from '@heavy-duty/bulldozer-store';
import {
  RouteStore,
  TabStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { generateInstructionCode } from '@heavy-duty/generator';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class ViewInstructionStore extends ComponentStore<object> {
  readonly connected$ = this._walletStore.connected$;
  readonly instruction$ = this.select(
    this._routeStore.instructionId$,
    this._instructionStore.instructions$,
    (instructionId, instructions) =>
      instructions.find((instruction) => instruction.id === instructionId)
  );
  readonly instructionBody$ = this.select(
    this.instruction$,
    (instruction) => instruction && instruction.data.body
  );
  readonly instructionContext$ = this.select(
    this.instruction$,
    this._instructionArgumentStore.instructionArguments$,
    this._instructionAccountStore.instructionAccounts$,
    this._instructionRelationStore.instructionRelations$,
    this._collectionStore.collections$,
    this._routeStore.workspaceId$,
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
    private readonly _walletStore: WalletStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _instructionStore: InstructionStore,
    private readonly _instructionAccountStore: InstructionAccountStore,
    private readonly _instructionArgumentStore: InstructionArgumentStore,
    private readonly _instructionRelationStore: InstructionRelationStore,
    private readonly _router: Router,
    private readonly _tabStore: TabStore,
    private readonly _routeStore: RouteStore,
    private readonly _themeService: DarkThemeService
  ) {
    super({});
  }

  /* readonly openTab$ = this.effect(() =>
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
            urlAsArray.length === 2 && urlAsArray[0] === 'instructions'
        )
      ),
      this.instruction$.pipe(isNotNullOrUndefined),
    ]).pipe(
      tap(([, instruction]) =>
        this._tabStore.openTab({
          id: instruction.id,
          label: instruction.name,
          url: `/instructions/${instruction.id}`,
        })
      )
    )
  ); */

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
            instructionId: instruction.id,
            instructionBody,
          })
        )
      )
  );
}
