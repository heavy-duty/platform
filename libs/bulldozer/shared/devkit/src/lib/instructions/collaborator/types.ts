export interface CreateCollaboratorParams {
  authority: string;
  workspaceId: string;
  userId: string;
}

export interface DeleteCollaboratorParams {
  authority: string;
  workspaceId: string;
  collaboratorId: string;
}
