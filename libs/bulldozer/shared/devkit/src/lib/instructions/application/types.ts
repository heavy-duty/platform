import { ApplicationDto } from '../../utils';

export interface CreateApplicationParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
  applicationDto: ApplicationDto;
}

export interface UpdateApplicationParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
  applicationDto: ApplicationDto;
}

export interface DeleteApplicationParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
}
