import { Injectable } from '@angular/core';
import {
  InstructionApiService,
  InstructionSocketService,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notification-store';
import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
import { TabStore } from '@heavy-duty/bulldozer/application/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  Observable,
  of,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { ViewInstructionRouteStore } from './view-instruction-route.store';

interface ViewModel {
  instruction: Document<Instruction> | null;
}

const initialState: ViewModel = {
  instruction: null,
};

@Injectable()
export class ViewInstructionStore extends ComponentStore<ViewModel> {
  readonly instruction$ = this.select(({ instruction }) => instruction);

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _walletStore: WalletStore,
    private readonly _instructionApiService: InstructionApiService,
    private readonly _instructionSocketService: InstructionSocketService,
    private readonly _viewInstructionRouteStore: ViewInstructionRouteStore,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);
  }

  protected readonly loadInstruction = this.effect(() =>
    this._viewInstructionRouteStore.instructionId$.pipe(
      switchMap((instructionId) => {
        if (instructionId === null) {
          return EMPTY;
        }

        return this._instructionApiService.findById(instructionId).pipe(
          concatMap((instruction) =>
            this._instructionSocketService
              .instructionChanges(instructionId)
              .pipe(startWith(instruction))
          ),
          tapResponse(
            (instruction) => this.patchState({ instruction }),
            (error) => this._notificationStore.setError(error)
          )
        );
      })
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
        concatMap(([{ instruction, instructionBody }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionApiService
            .updateBody({
              instructionId: instruction.id,
              instructionBody,
              authority: authority.toBase58(),
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent('Update body request sent'),
                (error) => this._notificationStore.setError(error)
              )
            );
        })
      )
  );
}
