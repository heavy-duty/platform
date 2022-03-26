import { CollectionAttributeDto } from '../../utils';

export interface CreateCollectionAttributeParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
  collectionId: string;
  collectionAttributeId: string;
  collectionAttributeDto: CollectionAttributeDto;
}

export interface UpdateCollectionAttributeParams {
  authority: string;
  workspaceId: string;
  collectionId: string;
  collectionAttributeId: string;
  collectionAttributeDto: CollectionAttributeDto;
}

export interface DeleteCollectionAttributeParams {
  authority: string;
  workspaceId: string;
  collectionId: string;
  collectionAttributeId: string;
}
