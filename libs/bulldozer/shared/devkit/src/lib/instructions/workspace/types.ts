export interface CreateWorkspaceParams {
  workspaceId: string;
  authority: string;
  workspaceName: string;
}

export interface UpdateWorkspaceParams {
  authority: string;
  workspaceId: string;
  workspaceName: string;
}

export interface DeleteWorkspaceParams {
  authority: string;
  workspaceId: string;
}
