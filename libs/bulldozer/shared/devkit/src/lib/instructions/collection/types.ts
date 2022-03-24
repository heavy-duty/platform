export interface CreateCollectionParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
  collectionId: string;
  collectionName: string;
}

export interface UpdateCollectionParams {
  authority: string;
  workspaceId: string;
  collectionId: string;
  collectionName: string;
}

export interface DeleteCollectionParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
  collectionId: string;
}
