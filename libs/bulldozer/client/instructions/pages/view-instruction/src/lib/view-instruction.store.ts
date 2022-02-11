import { Injectable } from '@angular/core';
import {
  NotificationStore,
  TabStore,
} from '@bulldozer-client/core-data-access';
import {
  InstructionApiService,
  InstructionSocketService,
} from '@bulldozer-client/instructions-data-access';
import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
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
        instructionId: string;
        instructionBody: string;
      }>
    ) =>
      request$.pipe(
        concatMap((request) =>
          of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
        ),
        concatMap(([{ instructionId, instructionBody }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionApiService
            .updateBody({
              instructionId,
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
