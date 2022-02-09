import { CollectionAttributeDto } from '../../utils';

export interface CreateCollectionAttributeParams {
  workspaceId: string;
  authority: string;
  applicationId: string;
  collectionId: string;
  collectionAttributeId: string;
  collectionAttributeDto: CollectionAttributeDto;
}

export interface UpdateCollectionAttributeParams {
  authority: string;
  collectionAttributeId: string;
  collectionAttributeDto: CollectionAttributeDto;
}

export interface DeleteCollectionAttributeParams {
  authority: string;
  collectionId: string;
  collectionAttributeId: string;
}
