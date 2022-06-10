import * as anchor from '@heavy-duty/anchor';
import { AnchorError, AnchorProvider, Program } from '@heavy-duty/anchor';
import {
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
	SystemProgram,
} from '@solana/web3.js';
import { assert } from 'chai';
import { Bulldozer } from '../target/types/bulldozer';
import { UserManager } from '../target/types/user_manager';

describe('application', () => {
	const provider = AnchorProvider.env();
	anchor.setProvider(provider);
	const bulldozerProgram = anchor.workspace.Bulldozer as Program<Bulldozer>;
	const userManagerProgram = anchor.workspace
		.UserManager as Program<UserManager>;
	const workspaceName = 'my-workspace';
	const workspace = Keypair.generate();
	const application = Keypair.generate();
	const applicationName = 'my-app';
	let budgetPublicKey: PublicKey;
	let workspaceStatsPublicKey: PublicKey;
	const userUserName = 'user-name-1';
	const userName = 'User Name 1';
	const userThumbnailUrl = 'https://img/1.com';
	const newUserUserName = 'user-name-2';
	const newUserName = 'User Name 2';
	const newUserThumbnailUrl = 'https://img/2.com';

	before(async () => {
		[budgetPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('budget', 'utf8'), workspace.publicKey.toBuffer()],
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

		await bulldozerProgram.methods
			.createWorkspace({ name: workspaceName })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
			})
			.signers([workspace])
			.postInstructions([
				SystemProgram.transfer({
					fromPubkey: provider.wallet.publicKey,
					toPubkey: budgetPublicKey,
					lamports: LAMPORTS_PER_SOL,
				}),
			])
			.rpc();
	});

	it('should create account', async () => {
		// act
		await bulldozerProgram.methods
			.createApplication({
				name: applicationName,
			})
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				application: application.publicKey,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
			})
			.signers([application])
			.rpc();
		// assert
		const account = await bulldozerProgram.account.application.fetch(
			application.publicKey
		);
		const workspaceStatsAccount =
			await bulldozerProgram.account.workspaceStats.fetch(
				workspaceStatsPublicKey
			);
		assert.ok(account.authority.equals(provider.wallet.publicKey));
		assert.ok(account.workspace.equals(workspace.publicKey));
		assert.equal(account.name, applicationName);
		assert.equal(workspaceStatsAccount.quantityOfApplications, 1);
		assert.ok(account.createdAt.eq(account.updatedAt));
	});

	it('should update account', async () => {
		// arrange
		const applicationName = 'my-app2';
		// act
		await bulldozerProgram.methods
			.updateApplication({ name: applicationName })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				application: application.publicKey,
				workspace: workspace.publicKey,
			})
			.rpc();
		// assert
		const account = await bulldozerProgram.account.application.fetch(
			application.publicKey
		);
		assert.equal(account.name, applicationName);
		assert.ok(account.createdAt.lte(account.updatedAt));
	});

	it('should delete account', async () => {
		// act
		await bulldozerProgram.methods
			.deleteApplication()
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				application: application.publicKey,
				workspace: workspace.publicKey,
			})
			.rpc();
		// assert
		const account = await bulldozerProgram.account.application.fetchNullable(
			application.publicKey
		);
		const workspaceStatsAccount =
			await bulldozerProgram.account.workspaceStats.fetch(
				workspaceStatsPublicKey
			);
		assert.equal(account, null);
		assert.equal(workspaceStatsAccount.quantityOfApplications, 0);
	});

	it('should fail when deleting application with collections', async () => {
		// arrange
		const newApplicationName = 'sample';
		const newApplication = Keypair.generate();
		const collectionName = 'sample';
		const collection = Keypair.generate();
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.createApplication({ name: newApplicationName })
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					application: newApplication.publicKey,
					workspace: workspace.publicKey,
					authority: provider.wallet.publicKey,
				})
				.postInstructions([
					await bulldozerProgram.methods
						.createCollection({ name: collectionName })
						.accounts({
							userManagerProgram: userManagerProgram.programId,
							authority: provider.wallet.publicKey,
							workspace: workspace.publicKey,
							application: newApplication.publicKey,
							collection: collection.publicKey,
						})
						.instruction(),
				])
				.signers([newApplication, collection])
				.rpc();
			await bulldozerProgram.methods
				.deleteApplication()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					application: newApplication.publicKey,
					workspace: workspace.publicKey,
				})
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6020);
	});

	it('should fail when deleting application with instructions', async () => {
		// arrange
		const newApplicationName = 'sample';
		const newApplication = Keypair.generate();
		const instructionName = 'sample';
		const instruction = Keypair.generate();
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.createApplication({ name: newApplicationName })
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					application: newApplication.publicKey,
					workspace: workspace.publicKey,
					authority: provider.wallet.publicKey,
				})
				.postInstructions([
					await bulldozerProgram.methods
						.createInstruction({ name: instructionName })
						.accounts({
							userManagerProgram: userManagerProgram.programId,
							authority: provider.wallet.publicKey,
							workspace: workspace.publicKey,
							application: newApplication.publicKey,
							instruction: instruction.publicKey,
						})
						.instruction(),
				])
				.signers([newApplication, instruction])
				.rpc();
			await bulldozerProgram.methods
				.deleteApplication()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					application: newApplication.publicKey,
					workspace: workspace.publicKey,
				})
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6022);
	});

	it('should fail when providing wrong "workspace" to delete', async () => {
		// arrange
		const newWorkspace = Keypair.generate();
		const newWorkspaceName = 'sample';
		const newApplication = Keypair.generate();
		const newApplicationName = 'sample';
		const [newBudgetPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('budget', 'utf8'), newWorkspace.publicKey.toBuffer()],
			bulldozerProgram.programId
		);
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.createWorkspace({ name: newWorkspaceName })
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: newWorkspace.publicKey,
				})
				.postInstructions([
					SystemProgram.transfer({
						fromPubkey: provider.wallet.publicKey,
						toPubkey: newBudgetPublicKey,
						lamports: LAMPORTS_PER_SOL,
					}),
					await bulldozerProgram.methods
						.createApplication({ name: newApplicationName })
						.accounts({
							userManagerProgram: userManagerProgram.programId,
							authority: provider.wallet.publicKey,
							workspace: newWorkspace.publicKey,
							application: newApplication.publicKey,
						})
						.instruction(),
				])
				.signers([newWorkspace, newApplication])
				.rpc();
			await bulldozerProgram.methods
				.deleteApplication()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: newApplication.publicKey,
				})
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6033);
	});

	it('should fail when workspace has insufficient funds', async () => {
		// arrange
		const newWorkspace = Keypair.generate();
		const newWorkspaceName = 'sample';
		const newApplication = Keypair.generate();
		const newApplicationName = 'sample';
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.createApplication({ name: newApplicationName })
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: newWorkspace.publicKey,
					application: newApplication.publicKey,
				})
				.preInstructions([
					await bulldozerProgram.methods
						.createWorkspace({ name: newWorkspaceName })
						.accounts({
							userManagerProgram: userManagerProgram.programId,
							authority: provider.wallet.publicKey,
							workspace: newWorkspace.publicKey,
						})
						.instruction(),
				])
				.signers([newWorkspace, newApplication])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6027);
	});

	it('should fail when user is not a collaborator', async () => {
		// arrange
		const newApplication = Keypair.generate();
		const newApplicationName = 'sample';
		const newUser = Keypair.generate();
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.createApplication({ name: newApplicationName })
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: newUser.publicKey,
					workspace: workspace.publicKey,
					application: newApplication.publicKey,
				})
				.signers([newUser, newApplication])
				.preInstructions([
					SystemProgram.transfer({
						fromPubkey: provider.wallet.publicKey,
						toPubkey: newUser.publicKey,
						lamports: LAMPORTS_PER_SOL,
					}),
				])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 3012);
	});

	it('should fail when user is not an approved collaborator', async () => {
		// arrange
		const newApplication = Keypair.generate();
		const newApplicationName = 'sample';
		const newUser = Keypair.generate();
		let error: AnchorError | null = null;
		const [newUserPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('user', 'utf8'), newUser.publicKey.toBuffer()],
			userManagerProgram.programId
		);
		// act
		try {
			await bulldozerProgram.methods
				.createApplication({ name: newApplicationName })
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: newUser.publicKey,
					workspace: workspace.publicKey,
					application: newApplication.publicKey,
				})
				.preInstructions([
					SystemProgram.transfer({
						fromPubkey: provider.wallet.publicKey,
						toPubkey: newUser.publicKey,
						lamports: LAMPORTS_PER_SOL,
					}),
					await userManagerProgram.methods
						.createUser({
							name: newUserName,
							thumbnailUrl: newUserThumbnailUrl,
							userName: newUserUserName,
						})
						.accounts({
							authority: newUser.publicKey,
						})
						.signers([newUser])
						.preInstructions([])
						.instruction(),
					await bulldozerProgram.methods
						.requestCollaboratorStatus()
						.accounts({
							userManagerProgram: userManagerProgram.programId,
							authority: newUser.publicKey,
							user: newUserPublicKey,
							workspace: workspace.publicKey,
						})
						.instruction(),
				])
				.signers([newUser, newApplication])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6029);
	});
});
