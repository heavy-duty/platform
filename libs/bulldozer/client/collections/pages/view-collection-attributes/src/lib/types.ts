export interface CollectionAttributeItemView {
  id: string;
  name: string;
  kind: {
    id: number;
    name: string;
    size: number;
  };
  modifier: {
    id: number;
    name: string;
    size: number;
  } | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  collectionId: string;
  applicationId: string;
  workspaceId: string;
}
