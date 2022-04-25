import { Injectable } from '@angular/core';
import { HdBroadcasterStore } from '@heavy-duty/broadcaster';
import {
  BULLDOZER_PROGRAM_ID,
  instructionCoder,
} from '@heavy-duty/bulldozer-devkit';
import { TransactionStatus } from '@heavy-duty/ngx-solana';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import {
  Transaction,
  TransactionConfirmationStatus,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  combineLatest,
  concatMap,
  EMPTY,
  filter,
  from,
  map,
  startWith,
  take,
  tap,
} from 'rxjs';

export interface InstructionStatus {
  transaction: Transaction;
  instruction: TransactionInstruction;
  status: TransactionConfirmationStatus | 'pending';
  title: string;
  name: string;
  accounts: {
    name: string;
    pubkey: string;
    isSigner: boolean;
    isWritable: boolean;
  }[];
  confirmedAt?: number;
}

interface ViewModel {
  pendingInstructionStatusesMap: Map<string, InstructionStatus> | null;
  instructionStatusesMap: Map<string, InstructionStatus>;
  lastInstructionStatus: InstructionStatus | null;
}

const initialState: ViewModel = {
  instructionStatusesMap: new Map<string, InstructionStatus>(),
  pendingInstructionStatusesMap: null,
  lastInstructionStatus: null,
};

const createInstructionStatus = (
  transactionStatus: TransactionStatus,
  instruction: TransactionInstruction
): InstructionStatus | null => {
  const transactionResponse = transactionStatus.transactionResponse;

  if (transactionResponse === undefined) {
    return null;
  }

  const decodedInstruction = instructionCoder.decode(instruction.data);

  if (decodedInstruction === null) {
    return null;
  }

  const decodedAndFormattedInstruction = instructionCoder.format(
    decodedInstruction,
    instruction.keys
  );

  if (decodedAndFormattedInstruction === null) {
    return null;
  }

  return {
    transaction: transactionResponse.transaction,
    instruction,
    status: transactionStatus.status,
    name: decodedInstruction.name,
    title: decodedInstruction.name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, function (str) {
        return str.toUpperCase();
      }),
    accounts: decodedAndFormattedInstruction.accounts.map((account) => ({
      ...account,
      name: account.name ?? 'Unknown',
      pubkey: account.pubkey.toBase58(),
    })),
    confirmedAt: transactionStatus.confirmedAt,
  };
};

@Injectable()
export class WorkspaceInstructionsStore extends ComponentStore<ViewModel> {
  readonly instructionStatusesMap$ = this.select(
    ({ instructionStatusesMap }) => instructionStatusesMap
  );
  readonly pendingInstructionStatusesMap$ = this.select(
    ({ pendingInstructionStatusesMap }) => pendingInstructionStatusesMap
  );
  readonly instructionStatuses$ = this.select(
    this.instructionStatusesMap$,
    (instructionStatusesMap) =>
      Array.from(
        instructionStatusesMap,
        ([, instructionStatus]) => instructionStatus
      )
  );
  readonly pendingInstructionStatuses$ = this.select(
    this.pendingInstructionStatusesMap$,
    (pendingInstructionStatusesMap) =>
      pendingInstructionStatusesMap
        ? Array.from(
            pendingInstructionStatusesMap,
            ([, pendingInstructionStatus]) => pendingInstructionStatus
          )
        : null
  );
  readonly instructionsInProcess$ = this.select(
    this.instructionStatuses$,
    (instructionStatuses) =>
      instructionStatuses.filter(
        (instructionStatus) => instructionStatus.status === 'confirmed'
      ).length
  );
  readonly lastInstructionStatus$ = this.select(
    ({ lastInstructionStatus }) => lastInstructionStatus
  );
  readonly instruction$ = this.instructionStatuses$.pipe(
    concatMap((instructionStatuses) => {
      return this.lastInstructionStatus$.pipe(
        startWith(...instructionStatuses),
        isNotNullOrUndefined
      );
    })
  );

  constructor(private readonly _hdBroadcasterStore: HdBroadcasterStore) {
    super(initialState);

    /* this._handleTransactionStatuses(
      this._hdBroadcasterStore.transactionStatuses$
    );
    this._handlePendingTransactionStatuses(
      this._hdBroadcasterStore.pendingTransactionStatuses$
    );
    this._handleLastTransactionStatus(
      this._hdBroadcasterStore.lastTransactionStatus$
    ); */
  }

  private readonly _handleLastTransactionStatus =
    this.effect<TransactionStatus | null>(
      concatMap((lastTransactionStatus) => {
        if (
          lastTransactionStatus === null ||
          lastTransactionStatus.transactionResponse === undefined
        ) {
          return EMPTY;
        }

        return from(
          lastTransactionStatus.transactionResponse.transaction.instructions
        ).pipe(
          filter((instruction) =>
            instruction.programId.equals(BULLDOZER_PROGRAM_ID)
          ),
          tap((instruction) => {
            this.patchState({
              lastInstructionStatus: createInstructionStatus(
                lastTransactionStatus,
                instruction
              ),
            });
          })
        );
      })
    );

  private readonly _handleTransactionStatuses = this.updater<
    TransactionStatus[]
  >((state, transactionStatuses) => ({
    ...state,
    instructionStatusesMap: new Map(
      transactionStatuses.reduce(
        (
          instructionStatuses: [string, InstructionStatus][],
          transactionStatus: TransactionStatus
        ) => [
          ...instructionStatuses,
          ...(transactionStatus.transactionResponse === undefined
            ? []
            : transactionStatus.transactionResponse.transaction.instructions
                .map((instruction, index) =>
                  instruction.programId.equals(BULLDOZER_PROGRAM_ID)
                    ? [
                        `${transactionStatus.signature}:${index}`,
                        createInstructionStatus(transactionStatus, instruction),
                      ]
                    : null
                )
                .filter(
                  (
                    instructionStatus
                  ): instructionStatus is [string, InstructionStatus] =>
                    instructionStatus !== null
                )),
        ],
        []
      )
    ),
  }));

  private readonly _handlePendingTransactionStatuses = this.updater<
    TransactionStatus[] | null
  >((state, transactionStatuses) => ({
    ...state,
    pendingInstructionStatusesMap:
      transactionStatuses === null
        ? null
        : new Map(
            transactionStatuses.reduce(
              (
                instructionStatuses: [string, InstructionStatus][],
                transactionStatus: TransactionStatus
              ) => [
                ...instructionStatuses,
                ...(transactionStatus.transactionResponse === undefined
                  ? []
                  : transactionStatus.transactionResponse.transaction.instructions
                      .map((instruction, index) =>
                        instruction.programId.equals(BULLDOZER_PROGRAM_ID)
                          ? [
                              `${transactionStatus.signature}:${index}`,
                              createInstructionStatus(
                                transactionStatus,
                                instruction
                              ),
                            ]
                          : null
                      )
                      .filter(
                        (
                          instructionStatus
                        ): instructionStatus is [string, InstructionStatus] =>
                          instructionStatus !== null
                      )),
              ],
              []
            )
          ),
  }));

  getInstruction() {
    return combineLatest([
      this.pendingInstructionStatuses$.pipe(
        map(
          (instructionStatuses) =>
            instructionStatuses?.filter(
              (instructionStatus) => instructionStatus.status === 'confirmed'
            ) ?? null
        ),
        isNotNullOrUndefined,
        take(1)
      ),
      this.instructionStatuses$.pipe(
        map((instructionStatuses) =>
          instructionStatuses.filter(
            (instructionStatus) => instructionStatus.status === 'confirmed'
          )
        )
      ),
      this.lastInstructionStatus$,
    ]).pipe(
      concatMap(([, instructionStatuses, lastInstructionStatus]) => {
        return this.lastInstructionStatus$.pipe(
          startWith(
            ...(lastInstructionStatus === null
              ? instructionStatuses
              : instructionStatuses.filter(
                  (instructionStatus) =>
                    instructionStatus.transaction.signature !==
                    lastInstructionStatus.transaction.signature
                ))
          ),
          isNotNullOrUndefined
        );
      })
    );
  }
}
