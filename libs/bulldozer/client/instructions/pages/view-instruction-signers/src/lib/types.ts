export interface InstructionAccountItemView {
	id: string;
	name: string;
	kind: {
		id: number;
		name: string;
	};
	modifier: {
		id: number;
		name: string;
	} | null;
	isCreating: boolean;
	isUpdating: boolean;
	isDeleting: boolean;
	instructionId: string;
	applicationId: string;
	workspaceId: string;
}
