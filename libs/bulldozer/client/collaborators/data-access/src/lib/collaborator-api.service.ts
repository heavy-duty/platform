import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  Collaborator,
  CollaboratorFilters,
  collaboratorQueryBuilder,
  createCollaborator,
  createCollaboratorDocument,
  CreateCollaboratorParams,
  deleteCollaborator,
  DeleteCollaboratorParams,
  Document,
  getBulldozerError,
} from '@heavy-duty/bulldozer-devkit';
import { HdSolanaApiService } from '@heavy-duty/ngx-solana';
import {
  addInstructionToTransaction,
  partiallySignTransaction,
} from '@heavy-duty/rx-solana';
import { Keypair } from '@solana/web3.js';
import { catchError, concatMap, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CollaboratorApiService {
  constructor(private readonly _hdSolanaApiService: HdSolanaApiService) {}

  private handleError(error: unknown) {
    return throwError(() =>
      typeof error === 'number' ? getBulldozerError(error) : error
    );
  }

  // get collaborators
  find(filters: CollaboratorFilters) {
    const query = collaboratorQueryBuilder().where(filters).build();

    return this._hdSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), query)
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createCollaboratorDocument(pubkey, account)
          )
        )
      );
  }

  // get collaborator
  findById(collaboratorId: string): Observable<Document<Collaborator> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(collaboratorId)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo &&
            createCollaboratorDocument(collaboratorId, accountInfo)
        )
      );
  }

  // create collaborator
  create(params: Omit<CreateCollaboratorParams, 'collaboratorId'>) {
    const collaboratorKeypair = Keypair.generate();

    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(
        createCollaborator({
          ...params,
        })
      ),
      partiallySignTransaction(collaboratorKeypair),
      concatMap((transaction) =>
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }

  // delete collaborator
  delete(params: DeleteCollaboratorParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(deleteCollaborator(params)),
      concatMap((transaction) =>
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }
}
