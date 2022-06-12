import * as anchor from '@heavy-duty/anchor';
import { AnchorError, AnchorProvider, Program } from '@heavy-duty/anchor';
import {
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
	SystemProgram,
} from '@solana/web3.js';
import { assert } from 'chai';
import { Gateway } from '../target/types/gateway';
import { UserManager } from '../target/types/user_manager';
import { WorkspaceManager } from '../target/types/workspace_manager';

describe('workspace', () => {
	const provider = AnchorProvider.env();
	anchor.setProvider(provider);
	const gatewayProgram = anchor.workspace.Gateway as Program<Gateway>;
	const userManagerProgram = anchor.workspace
		.UserManager as Program<UserManager>;
	const workspaceManagerProgram = anchor.workspace
		.WorkspaceManager as Program<WorkspaceManager>;
	const newUser = Keypair.generate();
	const workspaceId = 1;
	let userPublicKey: PublicKey;
	let newUserPublicKey: PublicKey;
	let budgetPublicKey: PublicKey;
	let budgetWalletPublicKey: PublicKey;
	let workspacePublicKey: PublicKey;
	let workspaceStatsPublicKey: PublicKey;
	let collaboratorPublicKey: PublicKey;
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
		[workspacePublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('workspace', 'utf8'),
				userPublicKey.toBuffer(),
				new Uint8Array([workspaceId]),
			],
			workspaceManagerProgram.programId
		);
		[workspaceStatsPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('workspace_stats', 'utf8'), workspacePublicKey.toBuffer()],
			workspaceManagerProgram.programId
		);
		[collaboratorPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('collaborator', 'utf8'),
				workspacePublicKey.toBuffer(),
				userPublicKey.toBuffer(),
			],
			workspaceManagerProgram.programId
		);
		[budgetPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('budget', 'utf8'), workspacePublicKey.toBuffer()],
			workspaceManagerProgram.programId
		);
		[budgetWalletPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('budget_wallet', 'utf8'), budgetPublicKey.toBuffer()],
			workspaceManagerProgram.programId
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
	});

	it('should create account', async () => {
		// arrange
		const workspaceName = 'my-app';

		const budgetWalletRent =
			await provider.connection.getMinimumBalanceForRentExemption(0);
		const depositTotal = LAMPORTS_PER_SOL;
		// act
		await gatewayProgram.methods
			.createWorkspace(workspaceId, workspaceName)
			.accounts({
				workspaceManagerProgram: workspaceManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
			})
			.postInstructions([
				await workspaceManagerProgram.methods
					.depositToBudget({ amount: new anchor.BN(depositTotal) })
					.accounts({
						authority: provider.wallet.publicKey,
						workspace: workspacePublicKey,
					})
					.instruction(),
			])
			.rpc();
		// assert
		const workspaceAccount =
			await workspaceManagerProgram.account.workspace.fetch(workspacePublicKey);
		const workspaceStatsAccount =
			await workspaceManagerProgram.account.workspaceStats.fetch(
				workspaceStatsPublicKey
			);
		const collaboratorAccount =
			await workspaceManagerProgram.account.collaborator.fetch(
				collaboratorPublicKey
			);
		const budgetAccount = await workspaceManagerProgram.account.budget.fetch(
			budgetPublicKey
		);
		const budgetWalletAccount = await provider.connection.getAccountInfo(
			budgetWalletPublicKey
		);
		assert.isDefined(workspaceAccount);
		assert.isTrue(workspaceAccount.authority.equals(provider.wallet.publicKey));
		assert.isTrue(workspaceAccount.createdAt.eq(workspaceAccount.updatedAt));
		assert.equal(workspaceAccount.name, workspaceName);
		assert.isDefined(workspaceStatsAccount);
		assert.equal(workspaceStatsAccount.quantityOfCollaborators, 1);
		assert.isDefined(collaboratorAccount);
		assert.property(collaboratorAccount.status, 'approved');
		assert.isTrue(collaboratorAccount.isAdmin);
		assert.isDefined(budgetAccount);
		assert.isTrue(budgetAccount.totalDeposited.eq(new anchor.BN(depositTotal)));
		assert.isTrue(
			budgetAccount.totalValueLocked.eq(new anchor.BN(depositTotal))
		);
		assert.isDefined(budgetWalletAccount);
		assert.equal(
			budgetWalletAccount?.lamports,
			budgetWalletRent + depositTotal
		);
	});

	it('should update account', async () => {
		// arrange
		const workspaceName = 'my-app2';
		// act
		await workspaceManagerProgram.methods
			.updateWorkspace({ name: workspaceName })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspacePublicKey,
			})
			.rpc();
		// assert
		const account = await workspaceManagerProgram.account.workspace.fetch(
			workspacePublicKey
		);
		assert.isTrue(account.createdAt.lte(account.updatedAt));
		assert.equal(account.name, workspaceName);
	});

	it('should withdraw from budget', async () => {
		// arrange
		const amount = new anchor.BN(LAMPORTS_PER_SOL * 0.5);
		const budgetBefore = await provider.connection.getAccountInfo(
			budgetWalletPublicKey
		);
		// act
		await workspaceManagerProgram.methods
			.withdrawFromBudget({
				amount,
			})
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspacePublicKey,
			})
			.rpc();
		// assert
		const budgetAfter = await provider.connection.getAccountInfo(
			budgetWalletPublicKey
		);
		const budget = await workspaceManagerProgram.account.budget.fetch(
			budgetPublicKey
		);
		assert.isTrue(
			new anchor.BN(budgetBefore?.lamports ?? 0)
				.sub(amount)
				.eq(new anchor.BN(budgetAfter?.lamports ?? 0))
		);
		assert.isTrue(budget.totalDeposited.eq(new anchor.BN(LAMPORTS_PER_SOL)));
		assert.isTrue(budget.totalValueLocked.eq(new anchor.BN(amount)));
	});

	it('should fail when unauthorized user attempts to withdraw', async () => {
		// arrange
		const amount = new anchor.BN(LAMPORTS_PER_SOL);
		let error: AnchorError | null = null;
		// act
		try {
			await workspaceManagerProgram.methods
				.withdrawFromBudget({
					amount,
				})
				.accounts({
					authority: newUser.publicKey,
					workspace: workspacePublicKey,
				})
				.signers([newUser])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.code, 'UnauthorizedWithdraw');
	});

	it('should delete account', async () => {
		// act
		await gatewayProgram.methods
			.deleteWorkspace()
			.accounts({
				workspaceManagerProgram: workspaceManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspacePublicKey,
			})
			.rpc();
		// assert
		const workspaceAccount =
			await workspaceManagerProgram.account.workspace.fetchNullable(
				workspacePublicKey
			);
		const workspaceStatsAccount =
			await workspaceManagerProgram.account.workspaceStats.fetchNullable(
				workspaceStatsPublicKey
			);
		const collaboratorAccount =
			await workspaceManagerProgram.account.collaborator.fetchNullable(
				collaboratorPublicKey
			);
		const budgetAccount =
			await workspaceManagerProgram.account.budget.fetchNullable(
				budgetPublicKey
			);
		const budgetWalletAccount = await provider.connection.getAccountInfo(
			budgetWalletPublicKey
		);
		assert.isNull(workspaceAccount);
		assert.isNull(workspaceStatsAccount);
		assert.isNull(collaboratorAccount);
		assert.isNull(budgetAccount);
		assert.isNull(budgetWalletAccount);
	});

	/*it('should fail when deleting workspace with applications', async () => {
		// arrange
		const newWorkspaceName = 'sample';
		const newWorkspace = Keypair.generate();
		const applicationName = 'sample';
		const application = Keypair.generate();
		const [newBudgetPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('budget', 'utf8'), newWorkspace.publicKey.toBuffer()],
			workspaceManagerProgram.programId
		);
		let error: AnchorError | null = null;
		// act
		await workspaceManagerProgram.methods
			.createWorkspace({
				name: newWorkspaceName,
			})
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				workspace: newWorkspace.publicKey,
				authority: provider.wallet.publicKey,
			})
			.postInstructions([
				SystemProgram.transfer({
					fromPubkey: provider.wallet.publicKey,
					toPubkey: newBudgetPublicKey,
					lamports: LAMPORTS_PER_SOL,
				}),
				await bulldozerProgram.methods
					.createApplication({ name: applicationName })
					.accounts({
						workspaceManagerProgram: workspaceManagerProgram.programId,
						userManagerProgram: userManagerProgram.programId,
						authority: provider.wallet.publicKey,
						workspace: newWorkspace.publicKey,
						application: application.publicKey,
					})
					.instruction(),
			])
			.signers([application, newWorkspace])
			.rpc();
		try {
			await workspaceManagerProgram.methods
				.deleteWorkspace()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: newWorkspace.publicKey,
				})
				.rpc();
		} catch (err) {
			console.log(err);
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6024);
	});*/

	it('should fail when deleting workspace with collaborators', async () => {
		// arrange
		const newWorkspaceId = 2;
		const newWorkspaceName = 'sample';
		const [newWorkspacePublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('workspace', 'utf8'),
				userPublicKey.toBuffer(),
				new Uint8Array([newWorkspaceId]),
			],
			workspaceManagerProgram.programId
		);
		let error: AnchorError | null = null;
		// act
		await gatewayProgram.methods
			.createWorkspace(newWorkspaceId, newWorkspaceName)
			.accounts({
				workspaceManagerProgram: workspaceManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
			})
			.postInstructions([
				await workspaceManagerProgram.methods
					.createCollaborator({
						isAdmin: false,
					})
					.accounts({
						userManagerProgram: userManagerProgram.programId,
						workspace: newWorkspacePublicKey,
						user: newUserPublicKey,
						authority: provider.wallet.publicKey,
					})
					.instruction(),
			])
			.rpc();
		try {
			await workspaceManagerProgram.methods
				.deleteWorkspace()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: newWorkspacePublicKey,
				})
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(
			error?.error.errorCode.code,
			'CantDeleteWorkspaceWithCollaborators'
		);
	});

	it('should fail when user is not a collaborator', async () => {
		// arrange
		const newWorkspaceId = 2;
		const newWorkspaceName = 'sample2';
		const [newWorkspacePublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('workspace', 'utf8'),
				userPublicKey.toBuffer(),
				new Uint8Array([newWorkspaceId]),
			],
			workspaceManagerProgram.programId
		);
		const newUser = Keypair.generate();
		let error: AnchorError | null = null;
		// act
		try {
			await workspaceManagerProgram.methods
				.updateWorkspace({ name: newWorkspaceName })
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: newUser.publicKey,
					workspace: newWorkspacePublicKey,
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
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.code, 'AccountNotInitialized');
		assert.equal(error?.error.origin, 'user');
	});

	it('should fail when user is not an admin collaborator', async () => {
		// arrange
		const newWorkspaceId = 3;
		const newWorkspaceName = 'sample';
		const [newWorkspacePublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('workspace', 'utf8'),
				userPublicKey.toBuffer(),
				new Uint8Array([newWorkspaceId]),
			],
			workspaceManagerProgram.programId
		);
		const newUser = Keypair.generate();
		let error: AnchorError | null = null;
		// act
		await gatewayProgram.methods
			.createWorkspace(newWorkspaceId, newWorkspaceName)
			.accounts({
				workspaceManagerProgram: workspaceManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
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
					.instruction(),
			])
			.postInstructions([
				await workspaceManagerProgram.methods
					.requestCollaboratorStatus()
					.accounts({
						userManagerProgram: userManagerProgram.programId,
						authority: newUser.publicKey,
						workspace: newWorkspacePublicKey,
					})
					.instruction(),
			])
			.signers([newUser])
			.rpc();
		try {
			await workspaceManagerProgram.methods
				.updateWorkspace({ name: newWorkspaceName })
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: newUser.publicKey,
					workspace: newWorkspacePublicKey,
				})
				.signers([newUser])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.code, 'OnlyAdminCollaboratorCanUpdate');
	});
});
