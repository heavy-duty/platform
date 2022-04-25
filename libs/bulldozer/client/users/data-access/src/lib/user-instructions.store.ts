import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  instructionCoder,
} from '@heavy-duty/bulldozer-devkit';
import {
  HdSolanaTransactionsStore,
  TransactionStatus,
} from '@heavy-duty/ngx-solana';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import {
  Transaction,
  TransactionConfirmationStatus,
  TransactionInstruction,
} from '@solana/web3.js';
import { concatMap, EMPTY, filter, from, startWith, tap } from 'rxjs';

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
  viewed?: boolean;
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
  instruction: TransactionInstruction,
  viewed = false
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
    viewed,
  };
};

@Injectable()
export class UserInstructionsStore extends ComponentStore<ViewModel> {
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
  readonly instruction$ = this.instructionStatuses$.pipe(
    concatMap((instructionStatuses) =>
      this.lastInstructionStatus$.pipe(
        startWith(...instructionStatuses),
        isNotNullOrUndefined
      )
    )
  );

  constructor(
    private readonly _hdSolanaTransactionsStore: HdSolanaTransactionsStore
  ) {
    super(initialState);

    /* this._handleTransactionStatuses(
      this._hdSolanaTransactionsStore.transactionStatuses$
    );
    this._handleLastTransactionStatus(
      this._hdSolanaTransactionsStore.lastTransactionStatus$
    ); */
  }

  readonly markAsViewed = this.updater((state) => {
    const instructionStatusesMap = new Map(state.instructionStatusesMap);

    instructionStatusesMap.forEach((instructionStatus, key) => {
      if (
        instructionStatus.status === 'finalized' &&
        !instructionStatus.viewed
      ) {
        instructionStatusesMap.set(key, {
          ...instructionStatus,
          viewed: true,
        });
      }
    });

    return {
      ...state,
      instructionStatusesMap,
    };
  });

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
  >((state, transactionStatuses) => {
    const instructionStatusesMap = new Map(state.instructionStatusesMap);

    transactionStatuses.forEach((transactionStatus) => {
      transactionStatus.transactionResponse?.transaction.instructions.forEach(
        (instruction, index) => {
          const key = `${transactionStatus.signature}:${index}`;
          const instructionStatus = instructionStatusesMap.get(key);
          const newInstructionStatus = createInstructionStatus(
            transactionStatus,
            instruction,
            instructionStatus?.viewed ?? false
          );

          if (newInstructionStatus !== null) {
            instructionStatusesMap.set(key, newInstructionStatus);
          }
        }
      );
    });

    return {
      ...state,
      instructionStatusesMap,
    };
  });
}
