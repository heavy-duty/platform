import { Injectable } from '@angular/core';
import {
  createUser,
  createUserDocument,
  CreateUserParams,
  deleteUser,
  DeleteUserParams,
  Document,
  getBulldozerError,
  User,
} from '@heavy-duty/bulldozer-devkit';
import { HdSolanaApiService } from '@heavy-duty/ngx-solana';
import { addInstructionToTransaction } from '@heavy-duty/rx-solana';
import { catchError, concatMap, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  constructor(private readonly _hdSolanaApiService: HdSolanaApiService) {}

  private handleError(error: unknown) {
    return throwError(() =>
      typeof error === 'number' ? getBulldozerError(error) : error
    );
  }

  // get user
  findById(userId: string): Observable<Document<User> | null> {
    return this._hdSolanaApiService
      .getAccountInfo(userId)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo && createUserDocument(userId, accountInfo)
        )
      );
  }

  // create user
  create(params: CreateUserParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(createUser(params)),
      concatMap((transaction) =>
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }

  // delete user
  delete(params: DeleteUserParams) {
    return this._hdSolanaApiService.createTransaction(params.authority).pipe(
      addInstructionToTransaction(deleteUser(params)),
      concatMap((transaction) =>
        this._hdSolanaApiService
          .sendTransaction(transaction)
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }
}
