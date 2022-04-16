export interface CollectionItemView {
  id: string;
  name: string;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  applicationId: string;
  workspaceId: string;
}

export interface InstructionAccountItemView {
  id: string;
  name: string;
  kind: {
    id: number;
    name: string;
    collection: string | null;
  };
  modifier: {
    id: number;
    name: string;
    payer: string | null;
    space: number | null;
    close: string | null;
  } | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  instructionId: string;
  applicationId: string;
  workspaceId: string;
}
