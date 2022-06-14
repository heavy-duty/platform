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
import { CollectionManager } from '../target/types/collection_manager';
import { Gateway } from '../target/types/gateway';
import { UserManager } from '../target/types/user_manager';
import { WorkspaceManager } from '../target/types/workspace_manager';

describe('collection', () => {
	const provider = AnchorProvider.env();
	anchor.setProvider(provider);
	const gatewayProgram = anchor.workspace.Gateway as Program<Gateway>;
	const userManagerProgram = anchor.workspace
		.UserManager as Program<UserManager>;
	const workspaceManagerProgram = anchor.workspace
		.WorkspaceManager as Program<WorkspaceManager>;
	const applicationManagerProgram = anchor.workspace
		.ApplicationManager as Program<ApplicationManager>;
	const collectionManagerProgram = anchor.workspace
		.CollectionManager as Program<CollectionManager>;

	let userPublicKey: PublicKey;
	let newUserPublicKey: PublicKey;
	let budgetPublicKey: PublicKey;
	let budgetWalletPublicKey: PublicKey;
	let workspacePublicKey: PublicKey;
	let gatewayPublicKey: PublicKey;
	let applicationPublicKey: PublicKey;
	let collectionPublicKey: PublicKey;

	const gatewayBaseKeypair = Keypair.generate();
	const workspaceId = 21;
	const workspaceName = 'my-workspace';
	const applicationId = 1;
	const applicationName = 'my-app';
	const collectionId = 1;
	const collectionName = 'my-collection';
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
		[collectionPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('collection', 'utf8'),
				applicationPublicKey.toBuffer(),
				new anchor.BN(collectionId).toArrayLike(Buffer, 'le', 4),
			],
			collectionManagerProgram.programId
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
				await gatewayProgram.methods
					.createApplication(applicationId, applicationName)
					.accounts({
						applicationManagerProgram: applicationManagerProgram.programId,
						workspaceManagerProgram: workspaceManagerProgram.programId,
						userManagerProgram: userManagerProgram.programId,
						authority: provider.wallet.publicKey,
						gateway: gatewayPublicKey,
						workspace: workspacePublicKey,
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
		const collectionRent =
			await provider.connection.getMinimumBalanceForRentExemption(157);
		// act
		await gatewayProgram.methods
			.createCollection(collectionId, collectionName)
			.accounts({
				collectionManagerProgram: collectionManagerProgram.programId,
				workspaceManagerProgram: workspaceManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				gateway: gatewayPublicKey,
				application: applicationPublicKey,
				workspace: workspacePublicKey,
				authority: provider.wallet.publicKey,
			})
			.rpc();
		// assert
		const collectionAccount =
			await collectionManagerProgram.account.collection.fetch(
				collectionPublicKey
			);
		const budgetAfter = await provider.connection.getAccountInfo(
			budgetWalletPublicKey
		);
		assert.ok(collectionAccount.authority.equals(gatewayPublicKey));
		assert.ok(collectionAccount.owner.equals(applicationPublicKey));
		assert.equal(collectionAccount.name, collectionName);
		assert.ok(collectionAccount.createdAt.eq(collectionAccount.updatedAt));
		assert.isTrue(
			new anchor.BN(budgetBefore?.lamports ?? 0)
				.sub(new anchor.BN(collectionRent))
				.eq(new anchor.BN(budgetAfter?.lamports ?? 0))
		);
	});

	it('should update account', async () => {
		// arrange
		const collectionName = 'things2';
		// act
		await gatewayProgram.methods
			.updateCollection(collectionName)
			.accounts({
				collectionManagerProgram: collectionManagerProgram.programId,
				workspaceManagerProgram: workspaceManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				gateway: gatewayPublicKey,
				authority: provider.wallet.publicKey,
				workspace: workspacePublicKey,
				application: applicationPublicKey,
				collection: collectionPublicKey,
			})
			.rpc();
		// assert
		const collectionAccount =
			await collectionManagerProgram.account.collection.fetch(
				collectionPublicKey
			);
		assert.equal(collectionAccount.name, collectionName);
		assert.ok(collectionAccount.createdAt.lte(collectionAccount.updatedAt));
	});

	it('should delete account', async () => {
		// arrange
		const budgetBefore = await provider.connection.getAccountInfo(
			budgetWalletPublicKey
		);
		const collectionRent =
			await provider.connection.getMinimumBalanceForRentExemption(157);
		// act
		await gatewayProgram.methods
			.deleteCollection()
			.accounts({
				collectionManagerProgram: collectionManagerProgram.programId,
				workspaceManagerProgram: workspaceManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				application: applicationPublicKey,
				workspace: workspacePublicKey,
				gateway: gatewayPublicKey,
				collection: collectionPublicKey,
			})
			.rpc();
		// assert
		const collectionAccount =
			await collectionManagerProgram.account.collection.fetchNullable(
				collectionPublicKey
			);
		const budgetAfter = await provider.connection.getAccountInfo(
			budgetWalletPublicKey
		);
		assert.isNull(collectionAccount);
		assert.isTrue(
			new anchor.BN(budgetBefore?.lamports ?? 0)
				.add(new anchor.BN(collectionRent))
				.eq(new anchor.BN(budgetAfter?.lamports ?? 0))
		);
	});

	it('should fail when providing wrong "application" to delete', async () => {
		// arrange
		const newApplicationId = 2;
		const newApplicationName = 'sample';
		const [newApplicationPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('application', 'utf8'),
				workspacePublicKey.toBuffer(),
				new anchor.BN(newApplicationId).toArrayLike(Buffer, 'le', 4),
			],
			applicationManagerProgram.programId
		);
		const newCollectionId = 2;
		const newCollectionName = 'sample';
		const [newCollectionPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('collection', 'utf8'),
				newApplicationPublicKey.toBuffer(),
				new anchor.BN(newCollectionId).toArrayLike(Buffer, 'le', 4),
			],
			collectionManagerProgram.programId
		);
		let error: AnchorError | null = null;
		// act
		await gatewayProgram.methods
			.createApplication(newApplicationId, newApplicationName)
			.accounts({
				applicationManagerProgram: applicationManagerProgram.programId,
				workspaceManagerProgram: workspaceManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				gateway: gatewayPublicKey,
				authority: provider.wallet.publicKey,
				workspace: workspacePublicKey,
			})
			.postInstructions([
				await gatewayProgram.methods
					.createCollection(newCollectionId, newCollectionName)
					.accounts({
						userManagerProgram: userManagerProgram.programId,
						collectionManagerProgram: collectionManagerProgram.programId,
						workspaceManagerProgram: workspaceManagerProgram.programId,
						gateway: gatewayPublicKey,
						authority: provider.wallet.publicKey,
						workspace: workspacePublicKey,
						application: newApplicationPublicKey,
						collection: newCollectionPublicKey,
					})
					.instruction(),
			])
			.rpc();
		try {
			await gatewayProgram.methods
				.deleteCollection()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					collectionManagerProgram: collectionManagerProgram.programId,
					workspaceManagerProgram: workspaceManagerProgram.programId,
					gateway: gatewayPublicKey,
					authority: provider.wallet.publicKey,
					workspace: workspacePublicKey,
					application: applicationPublicKey,
					collection: newCollectionPublicKey,
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
		const newWorkspaceId = 22;
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
		const [newApplicationPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('application', 'utf8'),
				newWorkspacePublicKey.toBuffer(),
				new anchor.BN(newApplicationId).toArrayLike(Buffer, 'le', 4),
			],
			applicationManagerProgram.programId
		);
		const newCollectionId = 3;
		const newCollectionName = 'sample';
		let error: AnchorError | null = null;
		const applicationRent =
			await provider.connection.getMinimumBalanceForRentExemption(130);
		// act
		await gatewayProgram.methods
			.createWorkspace(
				newWorkspaceId,
				newWorkspaceName,
				new anchor.BN(applicationRent)
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
						applicationManagerProgram: applicationManagerProgram.programId,
						workspaceManagerProgram: workspaceManagerProgram.programId,
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
				.createCollection(newCollectionId, newCollectionName)
				.accounts({
					collectionManagerProgram: collectionManagerProgram.programId,
					workspaceManagerProgram: workspaceManagerProgram.programId,
					userManagerProgram: userManagerProgram.programId,
					gateway: gatewayPublicKey,
					authority: provider.wallet.publicKey,
					workspace: newWorkspacePublicKey,
					application: newApplicationPublicKey,
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
		const newCollectionId = 4;
		const newCollectionName = 'sample';
		let error: AnchorError | null = null;
		// act
		await gatewayProgram.methods
			.createCollaborator()
			.accounts({
				workspaceManagerProgram: workspaceManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				gateway: gatewayPublicKey,
				authority: newUser.publicKey,
				workspace: workspacePublicKey,
			})
			.signers([newUser])
			.rpc();
		try {
			await gatewayProgram.methods
				.createCollection(newCollectionId, newCollectionName)
				.accounts({
					collectionManagerProgram: collectionManagerProgram.programId,
					workspaceManagerProgram: workspaceManagerProgram.programId,
					userManagerProgram: userManagerProgram.programId,
					gateway: gatewayPublicKey,
					authority: newUser.publicKey,
					workspace: workspacePublicKey,
					application: applicationPublicKey,
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
