import { Injectable } from '@angular/core';
import {
  BULLDOZER_PROGRAM_ID,
  createCreateInstructionInstruction2,
  createDeleteInstructionInstruction2,
  createInstructionDocument,
  CreateInstructionParams,
  createUpdateInstructionBodyInstruction2,
  createUpdateInstructionInstruction2,
  DeleteInstructionParams,
  Document,
  encodeFilters,
  Instruction,
  InstructionFilters,
  INSTRUCTION_ACCOUNT_NAME,
  UpdateInstructionBodyParams,
  UpdateInstructionParams,
} from '@heavy-duty/bulldozer-devkit';
import { NgxSolanaApiService } from '@heavy-duty/ngx-solana';
import { Keypair, PublicKey } from '@solana/web3.js';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstructionApiService {
  constructor(private readonly _ngxSolanaApiService: NgxSolanaApiService) {}

  // get instructions
  find(filters: InstructionFilters) {
    return this._ngxSolanaApiService
      .getProgramAccounts(BULLDOZER_PROGRAM_ID.toBase58(), {
        filters: encodeFilters(INSTRUCTION_ACCOUNT_NAME, filters),
      })
      .pipe(
        map((programAccounts) =>
          programAccounts.map(({ pubkey, account }) =>
            createInstructionDocument(new PublicKey(pubkey), account)
          )
        )
      );
  }

  // get instruction
  findByPublicKey(
    instructionPublicKey: string
  ): Observable<Document<Instruction> | null> {
    return this._ngxSolanaApiService
      .getAccountInfo(instructionPublicKey)
      .pipe(
        map(
          (accountInfo) =>
            accountInfo &&
            createInstructionDocument(
              new PublicKey(instructionPublicKey),
              accountInfo
            )
        )
      );
  }

  // create instruction
  create(params: Omit<CreateInstructionParams, 'instructionId'>) {
    const instructionKeypair = Keypair.generate();

    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) => {
        transaction.add(
          createCreateInstructionInstruction2({
            ...params,
            instructionId: instructionKeypair.publicKey.toBase58(),
          })
        );
        transaction.partialSign(instructionKeypair);
        return transaction;
      }
    );
  }

  // update instruction
  update(params: UpdateInstructionParams) {
    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) =>
        transaction.add(createUpdateInstructionInstruction2(params))
    );
  }

  // update instruction body
  updateBody(params: UpdateInstructionBodyParams) {
    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) =>
        transaction.add(createUpdateInstructionBodyInstruction2(params))
    );
  }

  // delete instruction
  delete(params: DeleteInstructionParams) {
    return this._ngxSolanaApiService.createAndSendTransaction(
      params.authority,
      (transaction) =>
        transaction.add(createDeleteInstructionInstruction2(params))
    );
  }
}
