export interface InstructionItemView {
	id: string;
	name: string;
	isCreating: boolean;
	isUpdating: boolean;
	isDeleting: boolean;
	applicationId: string;
	workspaceId: string;
	body: string;
	chunks: { position: number; data: string }[];
}
