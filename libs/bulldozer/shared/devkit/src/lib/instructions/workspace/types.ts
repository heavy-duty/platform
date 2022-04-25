import { WorkspaceDto } from '../../utils';

export interface CreateWorkspaceParams {
  workspaceId: string;
  authority: string;
  workspaceDto: WorkspaceDto;
}

export interface UpdateWorkspaceParams {
  authority: string;
  workspaceId: string;
  workspaceDto: WorkspaceDto;
}

export interface DeleteWorkspaceParams {
  authority: string;
  workspaceId: string;
}
