import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  InstructionApiService,
  InstructionSocketService,
} from '@bulldozer-client/instructions-data-access';
import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
import { TabStore } from '@heavy-duty/bulldozer/application/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';

interface ViewModel {
  instruction: Document<Instruction> | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  instruction: null,
  error: null,
};

@Injectable()
export class ViewInstructionStore extends ComponentStore<ViewModel> {
  readonly instruction$ = this.select(({ instruction }) => instruction);

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _tabStore: TabStore,
    private readonly _walletStore: WalletStore,
    private readonly _instructionApiService: InstructionApiService,
    private readonly _instructionSocketService: InstructionSocketService
  ) {
    super(initialState);

    this.loadInstruction(
      this._route.paramMap.pipe(
        map((paramMap) => paramMap.get('instructionId'))
      )
    );
  }

  protected readonly loadInstruction = this.effect(
    (instructionId$: Observable<string | null>) =>
      instructionId$.pipe(
        switchMap((instructionId) => {
          if (instructionId === null) {
            return of(null);
          }

          return this._instructionApiService
            .findByPublicKey(instructionId)
            .pipe(
              concatMap((instruction) => {
                if (!instruction) {
                  return of(null);
                }

                return this._instructionSocketService
                  .instructionChanges(instructionId)
                  .pipe(startWith(instruction));
              })
            );
        }),
        tapResponse(
          (instruction) => this.patchState({ instruction }),
          (error) => this.patchState({ error })
        )
      )
  );

  protected readonly openTab = this.effect(() =>
    this.instruction$.pipe(
      isNotNullOrUndefined,
      tap((instruction) =>
        this._tabStore.openTab({
          id: instruction.id,
          kind: 'instruction',
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
        concatMap((request) =>
          of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
        ),
        tap(([{ instruction, instructionBody }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionApiService.updateBody({
            instructionId: instruction.id,
            instructionBody,
            authority: authority.toBase58(),
          });
        })
      )
  );
}
