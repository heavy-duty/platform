export interface CreateCollectionParams {
  workspaceId: string;
  authority: string;
  applicationId: string;
  collectionId: string;
  collectionName: string;
}

export interface UpdateCollectionParams {
  authority: string;
  collectionId: string;
  collectionName: string;
}

export interface DeleteCollectionParams {
  authority: string;
  applicationId: string;
  collectionId: string;
}
