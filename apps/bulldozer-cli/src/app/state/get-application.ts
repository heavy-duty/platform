import { Program } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';
import { Bulldozer } from '../utils/bulldozer';

export interface Application {
	publicKey: PublicKey;
	name: string;
	authority: PublicKey;
	workspace: PublicKey;
	quantityOfCollections: number;
	quantityOfInstructions: number;
	createdAt: Date;
	updatedAt: Date;
}

export const getApplication = async (
	program: Program<Bulldozer>,
	applicationPublicKey: PublicKey
): Promise<Application | null> => {
	const application = await program.account.application.fetchNullable(
		applicationPublicKey
	);

	if (application === null) {
		return null;
	}

	const applicationStatsPublicKey = await PublicKey.createProgramAddress(
		[
			Buffer.from('application_stats', 'utf8'),
			applicationPublicKey.toBuffer(),
			Buffer.from([application.applicationStatsBump]),
		],
		program.programId
	);

	const applicationStats = await program.account.applicationStats.fetchNullable(
		applicationStatsPublicKey
	);

	if (applicationStats === null) {
		return null;
	}

	return {
		publicKey: applicationPublicKey,
		name: application.name,
		authority: application.authority,
		workspace: application.workspace,
		quantityOfCollections: applicationStats.quantityOfCollections,
		quantityOfInstructions: applicationStats.quantityOfInstructions,
		createdAt: new Date(application.createdAt.toNumber() * 1000),
		updatedAt: new Date(application.updatedAt.toNumber() * 1000),
	};
};
