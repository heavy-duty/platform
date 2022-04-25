import { CollectionDto } from '../../utils';

export interface CreateCollectionParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
  collectionId: string;
  collectionDto: CollectionDto;
}

export interface UpdateCollectionParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
  collectionId: string;
  collectionDto: CollectionDto;
}

export interface DeleteCollectionParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
  collectionId: string;
}
