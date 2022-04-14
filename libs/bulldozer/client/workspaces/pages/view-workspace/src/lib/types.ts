export interface UserItemView {
  id: string;
  name: string;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  userName: string;
  thumbnailUrl: string;
  authority: string;
  createdAt: number;
}

export interface WorkspaceItemView {
  id: string;
  name: string;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}
