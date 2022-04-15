export interface CollaboratorItemView {
  id: string;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  authority: string;
  userId: string;
  workspaceId: string;
  isAdmin: boolean;
  status: {
    id: number;
    name: string;
  };
  createdAt: number;
}

export interface UserItemView {
  id: string;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  authority: string;
  name: string;
  userName: string;
  thumbnailUrl: string;
}
