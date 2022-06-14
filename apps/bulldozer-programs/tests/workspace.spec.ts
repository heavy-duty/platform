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
	let userPublicKey: PublicKey;
	let budgetPublicKey: PublicKey;
	let budgetWalletPublicKey: PublicKey;
	let workspacePublicKey: PublicKey;
	let collaboratorPublicKey: PublicKey;
	let gatewayPublicKey: PublicKey;
	const newUser = Keypair.generate();
	const gatewayBaseKeypair = Keypair.generate();
	const workspaceId = 1;
	const userUserName = 'user-name-1';
	const userName = 'User Name 1';
	const userThumbnailUrl = 'https://img/1.com';
	const newUserUserName = 'user-name-2';
	const newUserName = 'User Name 2';
	const newUserThumbnailUrl = 'https://img/2.com';

	before(async () => {
		[gatewayPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('gateway', 'utf8'), gatewayBaseKeypair.publicKey.toBuffer()],
			gatewayProgram.programId
		);
		[userPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('user', 'utf8'), provider.wallet.publicKey.toBuffer()],
			userManagerProgram.programId
		);
		[workspacePublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('workspace', 'utf8'),
				userPublicKey.toBuffer(),
				new anchor.BN(workspaceId).toArrayLike(Buffer, 'le', 4),
			],
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

		await gatewayProgram.methods
			.createGateway()
			.accounts({
				authority: provider.wallet.publicKey,
				base: gatewayBaseKeypair.publicKey,
			})
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
			.createWorkspace(workspaceId, workspaceName, new anchor.BN(depositTotal))
			.accounts({
				gateway: gatewayPublicKey,
				workspaceManagerProgram: workspaceManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
			})
			.rpc();
		// assert
		const workspaceAccount =
			await workspaceManagerProgram.account.workspace.fetch(workspacePublicKey);
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
		assert.isTrue(workspaceAccount.authority.equals(gatewayPublicKey));
		assert.isTrue(workspaceAccount.createdAt.eq(workspaceAccount.updatedAt));
		assert.equal(workspaceAccount.name, workspaceName);
		assert.isDefined(collaboratorAccount);
		assert.property(collaboratorAccount.status, 'approved');
		assert.isTrue(collaboratorAccount.isAdmin);
		assert.isDefined(budgetAccount);
		assert.isTrue(budgetAccount.totalDeposited.eq(new anchor.BN(depositTotal)));
		assert.isTrue(budgetAccount.totalAvailable.eq(new anchor.BN(depositTotal)));
		assert.isTrue(budgetAccount.totalValueLocked.isZero());
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
		await gatewayProgram.methods
			.updateWorkspace(workspaceName)
			.accounts({
				gateway: gatewayPublicKey,
				userManagerProgram: userManagerProgram.programId,
				workspaceManagerProgram: workspaceManagerProgram.programId,
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
		const providerBefore = await provider.connection.getAccountInfo(
			provider.wallet.publicKey
		);
		const budgetBefore = await provider.connection.getAccountInfo(
			budgetWalletPublicKey
		);
		// act
		await gatewayProgram.methods
			.withdrawFromBudget(amount)
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				workspaceManagerProgram: workspaceManagerProgram.programId,
				gateway: gatewayPublicKey,
				authority: provider.wallet.publicKey,
				workspace: workspacePublicKey,
			})
			.rpc();
		// assert
		const providerAfter = await provider.connection.getAccountInfo(
			provider.wallet.publicKey
		);
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
		assert.isTrue(budget.totalAvailable.eq(new anchor.BN(amount)));
		assert.isAbove(providerAfter?.lamports ?? 0, providerBefore?.lamports ?? 0);
	});

	it('should fail when unauthorized user attempts to withdraw', async () => {
		// arrange
		const amount = new anchor.BN(LAMPORTS_PER_SOL);
		let error: AnchorError | null = null;
		// act
		try {
			await workspaceManagerProgram.methods
				.withdrawFromBudget({ amount })
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
		assert.equal(error?.error.errorCode.code, 'UnauthorizedWithdrawFromBudget');
		assert.equal(error?.error.origin, 'workspace');
	});

	it('should delete account', async () => {
		// act
		await gatewayProgram.methods
			.deleteWorkspace()
			.accounts({
				gateway: gatewayPublicKey,
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
		assert.isNull(collaboratorAccount);
		assert.isNull(budgetAccount);
		assert.isNull(budgetWalletAccount);
	});

	it('should fail to update when user is not an admin collaborator', async () => {
		// arrange
		const newWorkspaceId = 2;
		const newWorkspaceName = 'sample2';
		const [newWorkspacePublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('workspace', 'utf8'),
				userPublicKey.toBuffer(),
				new anchor.BN(newWorkspaceId).toArrayLike(Buffer, 'le', 4),
			],
			workspaceManagerProgram.programId
		);
		let error: AnchorError | null = null;
		// act
		await gatewayProgram.methods
			.createWorkspace(
				newWorkspaceId,
				newWorkspaceName,
				new anchor.BN(LAMPORTS_PER_SOL)
			)
			.accounts({
				gateway: gatewayPublicKey,
				workspaceManagerProgram: workspaceManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
			})
			.postInstructions([
				await gatewayProgram.methods
					.createCollaborator()
					.accounts({
						workspace: newWorkspacePublicKey,
						gateway: gatewayPublicKey,
						workspaceManagerProgram: workspaceManagerProgram.programId,
						userManagerProgram: userManagerProgram.programId,
						authority: newUser.publicKey,
					})
					.instruction(),
			])
			.signers([newUser])
			.rpc();
		try {
			await gatewayProgram.methods
				.updateWorkspace(newWorkspaceName)
				.accounts({
					workspaceManagerProgram: workspaceManagerProgram.programId,
					userManagerProgram: userManagerProgram.programId,
					gateway: gatewayPublicKey,
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
		assert.equal(error?.error.origin, 'collaborator');
	});
});
