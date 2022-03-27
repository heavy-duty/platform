import { Injectable } from '@angular/core';
import { HdBroadcasterStore } from '@heavy-duty/broadcaster';
import {
  BULLDOZER_PROGRAM_ID,
  createInstruction,
  createInstructionDocument,
  CreateInstructionParams,
  deleteInstruction,
  DeleteInstructionParams,
  Document,
  Instruction,
  InstructionFilters,
  instructionQueryBuilder,
  parseBulldozerError,
  updateInstruction,
  updateInstructionBody,
  UpdateInstructionBodyParams,
  UpdateInstructionParams,
} from '@heavy-duty/bulldozer-devkit';
import {
  HdSolanaApiService,
  HdSolanaConfigStore,
} from '@heavy-duty/ngx-solana';
import {
  addInstructionToTransaction,
  partiallySignTransaction,
} from '@heavy-duty/rx-solana';
import { Finality, Keypair } from '@solana/web3.js';
import {
  catchError,
  concatMap,
  first,
  map,
  Observable,
  tap,
  throwError,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionApiService {
  constructor(
    private readonly _hdSolanaApiService: HdSolanaApiService,
    private readonly _hdSolanaConfigStore: HdSolanaConfigStore,
    private readonly _hdBroadcasterStore: HdBroadcasterStore
  ) {}

  private handleError(error: string) {
    return throwError(() => parseBulldozerError(error) ?? null);
  }

  // get instruction ids
  findIds(filters: InstructionFilters, commitment: Finality = 'finalized') {
    const query = instructionQueryBuilder().where(filters).build();

    return this._hdSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
        ...query,
        commitment,
        dataSlice: { length: 0, offset: 0 },
      })
      .pipe(
        map((programAccounts) => programAccounts.map(({ pubkey }) => pubkey))
      );
  }

  // get instruction
  findById(
    instructionId: string,
    commitment: Finality = 'finalized'
  ): Observable<Document<Instruction> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(instructionId, commitment)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo && createInstructionDocument(instructionId, accountInfo)
        )
      );
  }

  // get instructions
  findByIds(instructionIds: string[], commitment: Finality = 'finalized') {
    return this._hdSolanaApiService
      .getMultipleAccounts(instructionIds, { commitment })
      .pipe(
        map((keyedAccounts) =>
          keyedAccounts.map(
            (keyedAccount) =>
              keyedAccount &&
              createInstructionDocument(
                keyedAccount.accountId,
                keyedAccount.accountInfo
              )
          )
        )
      );
  }

  // create instruction
  create(params: Omit<CreateInstructionParams, 'instructionId'>) {
    const instructionKeypair = Keypair.generate();

    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return createInstruction(apiEndpoint, {
              ...params,
              instructionId: instructionKeypair.publicKey.toBase58(),
            });
          })
        )
      ),
      partiallySignTransaction(instructionKeypair),
      concatMap((transaction) =>
        this._hdSolanaApiService.sendTransaction(transaction).pipe(
          tap((transactionSignature) =>
            this._hdBroadcasterStore.sendTransaction(
              transactionSignature,
              params.workspaceId
            )
          ),
          catchError((error) => this.handleError(error))
        )
      )
    );
  }

  // update instruction
  update(params: UpdateInstructionParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return updateInstruction(apiEndpoint, params);
          })
        )
      ),
      concatMap((transaction) =>
        this._hdSolanaApiService.sendTransaction(transaction).pipe(
          tap((transactionSignature) =>
            this._hdBroadcasterStore.sendTransaction(
              transactionSignature,
              params.workspaceId
            )
          ),
          catchError((error) => this.handleError(error))
        )
      )
    );
  }

  // update instruction body
  updateBody(params: UpdateInstructionBodyParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return updateInstructionBody(apiEndpoint, params);
          })
        )
      ),
      concatMap((transaction) =>
        this._hdSolanaApiService.sendTransaction(transaction).pipe(
          tap((transactionSignature) =>
            this._hdBroadcasterStore.sendTransaction(
              transactionSignature,
              params.workspaceId
            )
          ),
          catchError((error) => this.handleError(error))
        )
      )
    );
  }

  // delete instruction
  delete(params: DeleteInstructionParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        this._hdSolanaConfigStore.apiEndpoint$.pipe(
          first(),
          concatMap((apiEndpoint) => {
            if (apiEndpoint === null) {
              return throwError(() => 'API endpoint missing');
            }

            return deleteInstruction(apiEndpoint, params);
          })
        )
      ),
      concatMap((transaction) =>
        this._hdSolanaApiService.sendTransaction(transaction).pipe(
          tap((transactionSignature) =>
            this._hdBroadcasterStore.sendTransaction(
              transactionSignature,
              params.workspaceId
            )
          ),
          catchError((error) => this.handleError(error))
        )
      )
    );
  }
}
