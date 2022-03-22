import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  instructionCoder,
} from '@heavy-duty/bulldozer-devkit';
import {
  HdSolanaTransactionsStore,
  TransactionStatus,
} from '@heavy-duty/ngx-solana';
import { ComponentStore } from '@ngrx/component-store';
import {
  Transaction,
  TransactionConfirmationStatus,
  TransactionInstruction,
} from '@solana/web3.js';

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
}

const initialState: ViewModel = {
  instructionStatusesMap: new Map<string, InstructionStatus>(),
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

  constructor(
    private readonly _hdSolanaTransactionsStore: HdSolanaTransactionsStore
  ) {
    super(initialState);

    this._handleTransactionStatuses(
      this._hdSolanaTransactionsStore.transactionStatuses$
    );
  }

  private readonly _handleTransactionStatuses = this.updater<
    TransactionStatus[]
  >((state, transactionStatuses) => {
    const instructionStatusesMap = new Map(state.instructionStatusesMap);

    transactionStatuses.forEach((transactionStatus) => {
      const transactionResponse = transactionStatus.transactionResponse;

      if (transactionResponse !== undefined) {
        transactionResponse.transaction.instructions.forEach(
          (instruction, index) => {
            if (instruction.programId.equals(BULLDOZER_PROGRAM_ID)) {
              const decodedInstruction = instructionCoder.decode(
                instruction.data
              );

              if (decodedInstruction !== null) {
                const decodedAndFormattedInstruction = instructionCoder.format(
                  decodedInstruction,
                  instruction.keys
                );

                if (decodedAndFormattedInstruction !== null) {
                  const key = `${transactionStatus.signature}:${index}`;

                  instructionStatusesMap.set(key, {
                    transaction: transactionResponse.transaction,
                    instruction,
                    status: transactionStatus.status,
                    name: decodedInstruction.name,
                    title: decodedInstruction.name
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, function (str) {
                        return str.toUpperCase();
                      }),
                    accounts: decodedAndFormattedInstruction.accounts.map(
                      (account) => ({
                        ...account,
                        name: account.name ?? 'Unknown',
                        pubkey: account.pubkey.toBase58(),
                      })
                    ),
                  });
                }
              }
            }
          }
        );
      }
    });

    return {
      ...state,
      instructionStatusesMap,
    };
  });
}
