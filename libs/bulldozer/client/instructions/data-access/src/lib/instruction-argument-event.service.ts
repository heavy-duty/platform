import { Injectable } from '@angular/core';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import {
  Document,
  InstructionArgument,
  InstructionArgumentFilters,
} from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { Finality } from '@solana/web3.js';
import { concatMap, EMPTY, filter, map, Observable, of } from 'rxjs';
import { InstructionArgumentApiService } from './instruction-argument-api.service';

@Injectable({ providedIn: 'root' })
export class InstructionArgumentEventService {
  constructor(
    private readonly _instructionArgumentApiService: InstructionArgumentApiService,
    private readonly _workspaceInstructionStore: WorkspaceInstructionsStore
  ) {}

  documentCreated(filters: InstructionArgumentFilters) {
    return this._workspaceInstructionStore.getInstruction().pipe(
      filter(
        (instruction) =>
          instruction.name === 'createInstructionArgument' &&
          instruction.accounts.some((account) => {
            switch (account.name) {
              case 'Authority':
                return (
                  filters.authority === undefined ||
                  account.pubkey === filters.authority
                );
              case 'Workspace':
                return (
                  filters.workspace === undefined ||
                  account.pubkey === filters.workspace
                );
              case 'Application':
                return (
                  filters.application === undefined ||
                  account.pubkey === filters.application
                );
              case 'Instruction':
                return (
                  filters.instruction === undefined ||
                  account.pubkey === filters.instruction
                );
              default:
                return false;
            }
          })
      ),
      concatMap((instruction) => {
        const status = instruction.status;
        const documentId = instruction.accounts.find(
          (account) => account.name === 'Argument'
        )?.pubkey;

        if (documentId === undefined) {
          return EMPTY;
        }

        if (status === 'confirmed') {
          return this._instructionArgumentApiService
            .findById(documentId, status)
            .pipe(
              isNotNullOrUndefined,
              map((data) => ({
                data,
                status,
              }))
            );
        } else if (status === 'finalized') {
          return of({
            data: documentId,
            status,
          });
        } else {
          return EMPTY;
        }
      })
    );
  }

  documentUpdated(documentId: string): Observable<{
    status: Finality;
    data?: Document<InstructionArgument>;
  }> {
    return this._workspaceInstructionStore.getInstruction().pipe(
      filter(
        (instruction) =>
          instruction.name === 'updateInstructionArgument' &&
          instruction.accounts.some(
            (account) =>
              account.name === 'Argument' && account.pubkey === documentId
          )
      ),
      concatMap(({ status }) => {
        if (status === 'confirmed') {
          return this._instructionArgumentApiService
            .findById(documentId, status)
            .pipe(
              isNotNullOrUndefined,
              map((data) => ({
                data,
                status,
              }))
            );
        } else if (status === 'finalized') {
          return of({
            status,
          });
        } else {
          return EMPTY;
        }
      })
    );
  }

  documentDeleted(documentId: string): Observable<Finality> {
    return this._workspaceInstructionStore.getInstruction().pipe(
      filter(
        (instruction) =>
          instruction.name === 'deleteInstructionArgument' &&
          instruction.accounts.some(
            (account) =>
              account.name === 'Argument' && account.pubkey === documentId
          )
      ),
      concatMap(({ status }) => {
        if (status === 'confirmed') {
          return of(status);
        } else if (status === 'finalized') {
          return of(status);
        } else {
          return EMPTY;
        }
      })
    );
  }
}
