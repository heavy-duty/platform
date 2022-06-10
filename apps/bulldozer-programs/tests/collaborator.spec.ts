import * as anchor from '@heavy-duty/anchor';
import { AnchorProvider, Program } from '@heavy-duty/anchor';
import {
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
	SystemProgram,
} from '@solana/web3.js';
import { assert } from 'chai';
import { Bulldozer } from '../target/types/bulldozer';
import { UserManager } from '../target/types/user_manager';

describe('collaborator', () => {
	const provider = AnchorProvider.env();
	anchor.setProvider(provider);
	const bulldozerProgram = anchor.workspace.Bulldozer as Program<Bulldozer>;
	const userManagerProgram = anchor.workspace
		.UserManager as Program<UserManager>;
	const workspace = Keypair.generate();
	const newUser = Keypair.generate();
	const workspaceName = 'my-app';
	let collaboratorPublicKey: PublicKey;
	let newCollaboratorPublicKey: PublicKey;
	let userPublicKey: PublicKey;
	let newUserPublicKey: PublicKey;
	let workspaceStatsPublicKey: PublicKey;
	const userUserName = 'user-name-1';
	const userName = 'User Name 1';
	const userThumbnailUrl = 'https://img/1.com';
	const newUserUserName = 'user-name-2';
	const newUserName = 'User Name 2';
	const newUserThumbnailUrl = 'https://img/2.com';

	before(async () => {
		[userPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('user', 'utf8'), provider.wallet.publicKey.toBuffer()],
			userManagerProgram.programId
		);
		[newUserPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('user', 'utf8'), newUser.publicKey.toBuffer()],
			userManagerProgram.programId
		);
		[collaboratorPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('collaborator', 'utf8'),
				workspace.publicKey.toBuffer(),
				userPublicKey.toBuffer(),
			],
			bulldozerProgram.programId
		);
		[newCollaboratorPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('collaborator', 'utf8'),
				workspace.publicKey.toBuffer(),
				newUserPublicKey.toBuffer(),
			],
			bulldozerProgram.programId
		);
		[workspaceStatsPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('workspace_stats', 'utf8'), workspace.publicKey.toBuffer()],
			bulldozerProgram.programId
		);

		try {
			await userManagerProgram.methods
				.createUser({
					name: userName,
					thumbnailUrl: userThumbnailUrl,
					userName: userUserName,
				})
				.accounts({
					authority: provider.wallet.publicKey,
				})
				.rpc();
		} catch (error) {}

		await userManagerProgram.methods
			.createUser({
				name: newUserName,
				thumbnailUrl: newUserThumbnailUrl,
				userName: newUserUserName,
			})
			.accounts({
				authority: newUser.publicKey,
				user: newUserPublicKey,
			})
			.signers([newUser])
			.preInstructions([
				SystemProgram.transfer({
					fromPubkey: provider.wallet.publicKey,
					toPubkey: newUser.publicKey,
					lamports: LAMPORTS_PER_SOL,
				}),
			])
			.rpc();

		await bulldozerProgram.methods
			.createWorkspace({ name: workspaceName })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
			})
			.signers([workspace])
			.rpc();
	});

	it('should create admin collaborator', async () => {
		// assert
		const collaboratorAccount =
			await bulldozerProgram.account.collaborator.fetch(collaboratorPublicKey);
		assert.ok(collaboratorAccount.authority.equals(provider.wallet.publicKey));
		assert.equal(collaboratorAccount.isAdmin, true);
		assert.ok('approved' in collaboratorAccount.status);
	});

	it('should request collaborator status', async () => {
		// act
		await bulldozerProgram.methods
			.requestCollaboratorStatus()
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: newUser.publicKey,
				workspace: workspace.publicKey,
			})
			.signers([newUser])
			.rpc();
		// assert
		const collaboratorAccount =
			await bulldozerProgram.account.collaborator.fetch(
				newCollaboratorPublicKey
			);
		const workspaceStatsAccount =
			await bulldozerProgram.account.workspaceStats.fetch(
				workspaceStatsPublicKey
			);
		assert.ok(collaboratorAccount.authority.equals(newUser.publicKey));
		assert.equal(collaboratorAccount.isAdmin, false);
		assert.ok('pending' in collaboratorAccount.status);
		assert.ok(collaboratorAccount.user.equals(newUserPublicKey));
		assert.ok(collaboratorAccount.workspace.equals(workspace.publicKey));
		assert.equal(workspaceStatsAccount.quantityOfCollaborators, 2);
	});

	it('should approve collaborator', async () => {
		// act
		await bulldozerProgram.methods
			.updateCollaborator({ status: 1 })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				collaborator: newCollaboratorPublicKey,
			})
			.rpc();
		// assert
		const collaboratorAccount =
			await bulldozerProgram.account.collaborator.fetch(
				newCollaboratorPublicKey
			);
		assert.ok('approved' in collaboratorAccount.status);
	});

	it('should delete collaborator', async () => {
		// act
		await bulldozerProgram.methods
			.deleteCollaborator()
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				collaborator: newCollaboratorPublicKey,
			})
			.rpc();
		// assert
		const collaboratorAccount =
			await bulldozerProgram.account.collaborator.fetchNullable(
				newCollaboratorPublicKey
			);
		const workspaceStatsAccount =
			await bulldozerProgram.account.workspaceStats.fetch(
				workspaceStatsPublicKey
			);
		assert.equal(collaboratorAccount, null);
		assert.equal(workspaceStatsAccount.quantityOfCollaborators, 1);
	});

	it('should reject collaborator status request', async () => {
		// act
		await bulldozerProgram.methods
			.updateCollaborator({ status: 2 })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				collaborator: newCollaboratorPublicKey,
			})
			.preInstructions([
				await bulldozerProgram.methods
					.requestCollaboratorStatus()
					.accounts({
						userManagerProgram: userManagerProgram.programId,
						authority: newUser.publicKey,
						workspace: workspace.publicKey,
					})

					.instruction(),
			])
			.signers([newUser])
			.rpc();
		// assert
		const collaboratorAccount =
			await bulldozerProgram.account.collaborator.fetch(
				newCollaboratorPublicKey
			);
		assert.ok('rejected' in collaboratorAccount.status);
	});

	it('should retry collaborator status request', async () => {
		// act
		await bulldozerProgram.methods
			.retryCollaboratorStatusRequest()
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: newUser.publicKey,
				collaborator: newCollaboratorPublicKey,
				workspace: workspace.publicKey,
			})
			.signers([newUser])
			.rpc();
		// assert
		const collaboratorAccount =
			await bulldozerProgram.account.collaborator.fetch(
				newCollaboratorPublicKey
			);
		assert.ok('pending' in collaboratorAccount.status);
	});
});
