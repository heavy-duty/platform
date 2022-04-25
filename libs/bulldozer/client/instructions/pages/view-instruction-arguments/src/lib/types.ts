export interface InstructionArgumentItemView {
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
  instructionId: string;
  applicationId: string;
  workspaceId: string;
}
