import { Injectable } from '@angular/core';
import { HdBroadcasterStore } from '@heavy-duty/broadcaster';
import {
  BULLDOZER_PROGRAM_ID,
  instructionCoder,
} from '@heavy-duty/bulldozer-devkit';
import { TransactionStatus } from '@heavy-duty/ngx-solana';
import { ComponentStore } from '@ngrx/component-store';
import {
  Transaction,
  TransactionConfirmationStatus,
  TransactionInstruction,
} from '@solana/web3.js';
import { concatMap, EMPTY, filter, from, tap } from 'rxjs';

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
}

interface ViewModel {
  instructionStatusesMap: Map<string, InstructionStatus>;
  lastInstructionStatus: InstructionStatus | null;
}

const initialState: ViewModel = {
  instructionStatusesMap: new Map<string, InstructionStatus>(),
  lastInstructionStatus: null,
};

const createInstructionStatus = (
  transactionStatus: TransactionStatus,
  instruction: TransactionInstruction
) => {
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
  };
};

@Injectable()
export class WorkspaceInstructionsStore extends ComponentStore<ViewModel> {
  readonly instructionStatusesMap$ = this.select(
    ({ instructionStatusesMap }) => instructionStatusesMap
  );
  readonly instructionStatuses$ = this.select(
    this.instructionStatusesMap$,
    (instructionStatusesMap) =>
      Array.from(
        instructionStatusesMap,
        ([, instructionStatus]) => instructionStatus
      )
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

  constructor(private readonly _hdBroadcasterStore: HdBroadcasterStore) {
    super(initialState);

    console.log('am I even called?');

    this._handleTransactionStatuses(
      this._hdBroadcasterStore.transactionStatuses$
    );
    this._handleLastTransactionStatus(
      this._hdBroadcasterStore.lastTransactionStatus$
    );
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
          tap((instruction) =>
            this.patchState({
              lastInstructionStatus: createInstructionStatus(
                lastTransactionStatus,
                instruction
              ),
            })
          )
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
}
