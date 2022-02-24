export interface CreateApplicationParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
  applicationName: string;
}

export interface UpdateApplicationParams {
  authority: string;
  applicationId: string;
  applicationName: string;
}

export interface DeleteApplicationParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
}
