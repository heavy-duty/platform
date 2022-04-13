import { Injectable } from '@angular/core';
import { ApplicationApiService } from '@bulldozer-client/applications-data-access';
import {
  CollectionApiService,
  CollectionAttributeApiService,
} from '@bulldozer-client/collections-data-access';
import {
  InstructionAccountApiService,
  InstructionApiService,
  InstructionArgumentApiService,
  InstructionRelationApiService,
} from '@bulldozer-client/instructions-data-access';
import { WorkspaceApiService } from '@bulldozer-client/workspaces-data-access';
import {
  generateWorkspaceMetadata,
  generateWorkspaceZip,
} from '@heavy-duty/generator';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { concatMap, forkJoin, from, tap, toArray } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WorkspaceDownloaderService {
  constructor(
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _applicationApiService: ApplicationApiService,
    private readonly _collectionApiService: CollectionApiService,
    private readonly _collectionAttributeApiService: CollectionAttributeApiService,
    private readonly _instructionApiService: InstructionApiService,
    private readonly _instructionArgumentApiService: InstructionArgumentApiService,
    private readonly _instructionAccountApiService: InstructionAccountApiService,
    private readonly _instructionRelationApiService: InstructionRelationApiService
  ) {}

  downloadWorkspace(workspaceId: string) {
    return forkJoin({
      workspace: this._workspaceApiService.findById(workspaceId),
      applications: this._applicationApiService
        .findIds({ workspace: workspaceId })
        .pipe(
          concatMap((applicationIds) =>
            this._applicationApiService
              .findByIds(applicationIds)
              .pipe(
                concatMap((applications) =>
                  from(applications).pipe(isNotNullOrUndefined, toArray())
                )
              )
          )
        ),
      collections: this._collectionApiService
        .findIds({ workspace: workspaceId })
        .pipe(
          concatMap((collectionIds) =>
            this._collectionApiService
              .findByIds(collectionIds)
              .pipe(
                concatMap((collections) =>
                  from(collections).pipe(isNotNullOrUndefined, toArray())
                )
              )
          )
        ),
      collectionAttributes: this._collectionAttributeApiService
        .findIds({ workspace: workspaceId })
        .pipe(
          concatMap((collectionAttributeIds) =>
            this._collectionAttributeApiService
              .findByIds(collectionAttributeIds)
              .pipe(
                concatMap((collectionAttributes) =>
                  from(collectionAttributes).pipe(
                    isNotNullOrUndefined,
                    toArray()
                  )
                )
              )
          )
        ),
      instructions: this._instructionApiService
        .findIds({
          workspace: workspaceId,
        })
        .pipe(
          concatMap((instructionIds) =>
            this._instructionApiService
              .findByIds(instructionIds)
              .pipe(
                concatMap((instructions) =>
                  from(instructions).pipe(isNotNullOrUndefined, toArray())
                )
              )
          )
        ),
      instructionArguments: this._instructionArgumentApiService
        .findIds({
          workspace: workspaceId,
        })
        .pipe(
          concatMap((instructionArgumentIds) =>
            this._instructionArgumentApiService
              .findByIds(instructionArgumentIds)
              .pipe(
                concatMap((instructionArguments) =>
                  from(instructionArguments).pipe(
                    isNotNullOrUndefined,
                    toArray()
                  )
                )
              )
          )
        ),
      instructionAccounts: this._instructionAccountApiService
        .findIds({
          workspace: workspaceId,
        })
        .pipe(
          concatMap((instructionAccountIds) =>
            this._instructionAccountApiService
              .findByIds(instructionAccountIds)
              .pipe(
                concatMap((instructionAccounts) =>
                  from(instructionAccounts).pipe(
                    isNotNullOrUndefined,
                    toArray()
                  )
                )
              )
          )
        ),
      instructionRelations: this._instructionRelationApiService
        .findIds({
          workspace: workspaceId,
        })
        .pipe(
          concatMap((instructionRelationIds) =>
            this._instructionRelationApiService
              .findByIds(instructionRelationIds)
              .pipe(
                concatMap((instructionRelations) =>
                  from(instructionRelations).pipe(
                    isNotNullOrUndefined,
                    toArray()
                  )
                )
              )
          )
        ),
    }).pipe(
      tap(
        ({
          workspace,
          applications,
          collections,
          collectionAttributes,
          instructions,
          instructionArguments,
          instructionAccounts,
          instructionRelations,
        }) =>
          workspace &&
          generateWorkspaceZip(
            workspace,
            generateWorkspaceMetadata(
              applications,
              collections,
              collectionAttributes,
              instructions,
              instructionArguments,
              instructionAccounts,
              instructionRelations
            )
          )
      )
    );
  }
}
