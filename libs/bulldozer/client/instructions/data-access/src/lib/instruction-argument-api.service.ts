import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createCreateInstructionArgumentInstruction2,
  createDeleteInstructionArgumentInstruction2,
  createInstructionArgumentDocument,
  CreateInstructionArgumentParams,
  createUpdateInstructionArgumentInstruction2,
  DeleteInstructionArgumentParams,
  Document,
  encodeFilters,
  InstructionArgument,
  InstructionArgumentFilters,
  INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
  UpdateInstructionArgumentParams,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { Keypair, PublicKey } from '@solana/web3.js';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionArgumentApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  // get instruction arguments
  find(filters: InstructionArgumentFilters) {
    return this._ngxSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(INSTRUCTION_ARGUMENT_ACCOUNT_NAME, filters),
      })
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createInstructionArgumentDocument(new PublicKey(pubkey), account)
          )
        )
      );
  }

  // get instruction argument
  findByPublicKey(
    instructionArgumentPublicKey: string
  ): Observable<Document<InstructionArgument> | null> {
    return this._ngxSolanaApiService
      .getAccountInfo(instructionArgumentPublicKey)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo &&
            createInstructionArgumentDocument(
              new PublicKey(instructionArgumentPublicKey),
              accountInfo
            )
        )
      );
  }

  // create instruction argument
  create(
    params: Omit<CreateInstructionArgumentParams, 'instructionArgumentId'>
  ) {
    const instructionArgumentKeypair = Keypair.generate();

    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) => {
        transaction.add(
          createCreateInstructionArgumentInstruction2({
            ...params,
            instructionArgumentId:
              instructionArgumentKeypair.publicKey.toBase58(),
          })
        );
        transaction.partialSign(instructionArgumentKeypair);
        return transaction;
      }
    );
  }

  // update instruction argument
  update(params: UpdateInstructionArgumentParams) {
    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) =>
        transaction.add(createUpdateInstructionArgumentInstruction2(params))
    );
  }

  // delete instruction argument
  delete(params: DeleteInstructionArgumentParams) {
    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) =>
        transaction.add(createDeleteInstructionArgumentInstruction2(params))
    );
  }
}
