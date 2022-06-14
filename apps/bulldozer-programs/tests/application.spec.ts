import * as anchor from '@heavy-duty/anchor';
import { AnchorError, AnchorProvider, Program } from '@heavy-duty/anchor';
import {
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
	SystemProgram,
} from '@solana/web3.js';
import { assert } from 'chai';
import { ApplicationManager } from '../target/types/application_manager';
import { Gateway } from '../target/types/gateway';
import { UserManager } from '../target/types/user_manager';
import { WorkspaceManager } from '../target/types/workspace_manager';

describe('application', () => {
	const provider = AnchorProvider.env();
	anchor.setProvider(provider);
	const gatewayProgram = anchor.workspace.Gateway as Program<Gateway>;
	const userManagerProgram = anchor.workspace
		.UserManager as Program<UserManager>;
	const workspaceManagerProgram = anchor.workspace
		.WorkspaceManager as Program<WorkspaceManager>;
	const applicationManagerProgram = anchor.workspace
		.ApplicationManager as Program<ApplicationManager>;

	let userPublicKey: PublicKey;
	let newUserPublicKey: PublicKey;
	let budgetPublicKey: PublicKey;
	let budgetWalletPublicKey: PublicKey;
	let workspacePublicKey: PublicKey;
	let gatewayPublicKey: PublicKey;
	let applicationPublicKey: PublicKey;

	const gatewayBaseKeypair = Keypair.generate();
	const workspaceId = 11;
	const workspaceName = 'my-workspace';
	const applicationId = 1;
	const applicationName = 'my-app';
	const userUserName = 'user-name-1';
	const userName = 'User Name 1';
	const userThumbnailUrl = 'https://img/1.com';
	const newUser = Keypair.generate();
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
		[newUserPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('user', 'utf8'), newUser.publicKey.toBuffer()],
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
		[applicationPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('application', 'utf8'),
				workspacePublicKey.toBuffer(),
				new anchor.BN(applicationId).toArrayLike(Buffer, 'le', 4),
			],
			applicationManagerProgram.programId
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
			.postInstructions([
				await gatewayProgram.methods
					.createWorkspace(
						workspaceId,
						workspaceName,
						new anchor.BN(LAMPORTS_PER_SOL)
					)
					.accounts({
						workspaceManagerProgram: workspaceManagerProgram.programId,
						userManagerProgram: userManagerProgram.programId,
						authority: provider.wallet.publicKey,
						gateway: gatewayPublicKey,
					})
					.instruction(),
			])
			.rpc();
	});

	it('should create account', async () => {
		// arrange
		const budgetBefore = await provider.connection.getAccountInfo(
			budgetWalletPublicKey
		);
		const applicationRent =
			await provider.connection.getMinimumBalanceForRentExemption(130);
		// act
		await gatewayProgram.methods
			.createApplication(applicationId, applicationName)
			.accounts({
				workspaceManagerProgram: workspaceManagerProgram.programId,
				applicationManagerProgram: applicationManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				gateway: gatewayPublicKey,
				authority: provider.wallet.publicKey,
				workspace: workspacePublicKey,
			})
			.rpc();
		// assert
		const applicationAccount =
			await applicationManagerProgram.account.application.fetch(
				applicationPublicKey
			);
		const budgetAfter = await provider.connection.getAccountInfo(
			budgetWalletPublicKey
		);
		assert.isTrue(applicationAccount.owner.equals(workspacePublicKey));
		assert.isTrue(applicationAccount.authority.equals(gatewayPublicKey));
		assert.equal(applicationAccount.name, applicationName);
		assert.isTrue(
			applicationAccount.createdAt.eq(applicationAccount.updatedAt)
		);
		assert.isTrue(
			new anchor.BN(budgetBefore?.lamports ?? 0)
				.sub(new anchor.BN(applicationRent))
				.eq(new anchor.BN(budgetAfter?.lamports ?? 0))
		);
	});

	it('should update account', async () => {
		// arrange
		const applicationName = 'my-app2';
		// act
		await gatewayProgram.methods
			.updateApplication(applicationName)
			.accounts({
				applicationManagerProgram: applicationManagerProgram.programId,
				workspaceManagerProgram: workspaceManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				gateway: gatewayPublicKey,
				authority: provider.wallet.publicKey,
				application: applicationPublicKey,
				workspace: workspacePublicKey,
			})
			.rpc();
		// assert
		const applicationAccount =
			await applicationManagerProgram.account.application.fetch(
				applicationPublicKey
			);
		assert.equal(applicationAccount.name, applicationName);
		assert.ok(applicationAccount.createdAt.lte(applicationAccount.updatedAt));
	});

	it('should delete account', async () => {
		// arrange
		const budgetBefore = await provider.connection.getAccountInfo(
			budgetWalletPublicKey
		);
		const applicationRent =
			await provider.connection.getMinimumBalanceForRentExemption(130);
		// act
		await gatewayProgram.methods
			.deleteApplication()
			.accounts({
				applicationManagerProgram: applicationManagerProgram.programId,
				workspaceManagerProgram: workspaceManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				gateway: gatewayPublicKey,
				authority: provider.wallet.publicKey,
				application: applicationPublicKey,
				workspace: workspacePublicKey,
			})
			.rpc();
		// assert
		const applicationAccount =
			await applicationManagerProgram.account.application.fetchNullable(
				applicationPublicKey
			);
		const budgetAfter = await provider.connection.getAccountInfo(
			budgetWalletPublicKey
		);
		assert.isNull(applicationAccount);
		assert.isTrue(
			new anchor.BN(budgetBefore?.lamports ?? 0)
				.add(new anchor.BN(applicationRent))
				.eq(new anchor.BN(budgetAfter?.lamports ?? 0))
		);
	});

	it('should fail when providing wrong "workspace" to delete', async () => {
		// arrange
		const newWorkspaceId = 12;
		const newWorkspaceName = 'sample';
		const [newWorkspacePublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('workspace', 'utf8'),
				userPublicKey.toBuffer(),
				new anchor.BN(newWorkspaceId).toArrayLike(Buffer, 'le', 4),
			],
			workspaceManagerProgram.programId
		);
		const newApplicationId = 2;
		const newApplicationName = 'sample';
		const [newApplicationPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('application', 'utf8'),
				newWorkspacePublicKey.toBuffer(),
				new anchor.BN(newApplicationId).toArrayLike(Buffer, 'le', 4),
			],
			applicationManagerProgram.programId
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
				workspaceManagerProgram: workspaceManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				gateway: gatewayPublicKey,
				authority: provider.wallet.publicKey,
			})
			.postInstructions([
				await gatewayProgram.methods
					.createApplication(newApplicationId, newApplicationName)
					.accounts({
						workspaceManagerProgram: workspaceManagerProgram.programId,
						applicationManagerProgram: applicationManagerProgram.programId,
						userManagerProgram: userManagerProgram.programId,
						gateway: gatewayPublicKey,
						authority: provider.wallet.publicKey,
						workspace: newWorkspacePublicKey,
					})
					.instruction(),
			])
			.rpc();
		try {
			await gatewayProgram.methods
				.deleteApplication()
				.accounts({
					applicationManagerProgram: applicationManagerProgram.programId,
					workspaceManagerProgram: workspaceManagerProgram.programId,
					userManagerProgram: userManagerProgram.programId,
					gateway: gatewayPublicKey,
					authority: provider.wallet.publicKey,
					workspace: workspacePublicKey,
					application: newApplicationPublicKey,
				})
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.code, 'InvalidApplication');
		assert.equal(error?.error.origin, 'application');
	});

	it('should fail when workspace has insufficient funds', async () => {
		// arrange
		const newWorkspaceId = 13;
		const newWorkspaceName = 'sample';
		const [newWorkspacePublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('workspace', 'utf8'),
				userPublicKey.toBuffer(),
				new anchor.BN(newWorkspaceId).toArrayLike(Buffer, 'le', 4),
			],
			workspaceManagerProgram.programId
		);
		const newApplicationId = 3;
		const newApplicationName = 'sample';
		let error: AnchorError | null = null;
		// act
		await gatewayProgram.methods
			.createWorkspace(newWorkspaceId, newWorkspaceName, new anchor.BN(0))
			.accounts({
				workspaceManagerProgram: workspaceManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				gateway: gatewayPublicKey,
				authority: provider.wallet.publicKey,
			})
			.rpc();
		try {
			await gatewayProgram.methods
				.createApplication(newApplicationId, newApplicationName)
				.accounts({
					applicationManagerProgram: applicationManagerProgram.programId,
					workspaceManagerProgram: workspaceManagerProgram.programId,
					userManagerProgram: userManagerProgram.programId,
					gateway: gatewayPublicKey,
					authority: provider.wallet.publicKey,
					workspace: newWorkspacePublicKey,
				})
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.code, 'BudgetHasInsufficientFunds');
	});

	it('should fail when user is not an approved collaborator', async () => {
		// arrange
		let error: AnchorError | null = null;
		const newApplicationId = 4;
		const newApplicationName = 'sample';
		const newWorkspaceId = 14;
		const newWorkspaceName = 'sample2';
		const [newWorkspacePublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('workspace', 'utf8'),
				userPublicKey.toBuffer(),
				new anchor.BN(newWorkspaceId).toArrayLike(Buffer, 'le', 4),
			],
			workspaceManagerProgram.programId
		);
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
				.createApplication(newApplicationId, newApplicationName)
				.accounts({
					applicationManagerProgram: applicationManagerProgram.programId,
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
		assert.equal(error?.error.errorCode.code, 'CollaboratorStatusNotApproved');
		assert.equal(error?.error.origin, 'collaborator');
	});
});
