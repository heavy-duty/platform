import { Program } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';
import { Bulldozer } from '../utils/bulldozer';

export interface Workspace {
	publicKey: PublicKey;
	name: string;
	authority: PublicKey;
	quantityOfApplications: number;
	quantityOfCollaborators: number;
	createdAt: Date;
	updatedAt: Date;
}

export const getWorkspace = async (
	program: Program<Bulldozer>,
	workspacePublicKey: PublicKey
): Promise<Workspace | null> => {
	const workspace = await program.account.workspace.fetchNullable(
		workspacePublicKey
	);

	if (workspace === null) {
		return null;
	}

	const workspaceStatsPublicKey = await PublicKey.createProgramAddress(
		[
			Buffer.from('workspace_stats', 'utf8'),
			workspacePublicKey.toBuffer(),
			Buffer.from([workspace.workspaceStatsBump]),
		],
		program.programId
	);

	const workspaceStats = await program.account.workspaceStats.fetchNullable(
		workspaceStatsPublicKey
	);

	if (workspaceStats === null) {
		return null;
	}

	return {
		publicKey: workspacePublicKey,
		name: workspace.name,
		authority: workspace.authority,
		quantityOfApplications: workspaceStats.quantityOfApplications,
		quantityOfCollaborators: workspaceStats.quantityOfCollaborators,
		createdAt: new Date(workspace.createdAt.toNumber() * 1000),
		updatedAt: new Date(workspace.updatedAt.toNumber() * 1000),
	};
};
