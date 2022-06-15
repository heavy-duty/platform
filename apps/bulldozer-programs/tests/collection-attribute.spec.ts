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

describe('collection attribute', () => {
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
	let collectionAttributePublicKey: PublicKey;

	const gatewayBaseKeypair = Keypair.generate();
	const workspaceId = 21;
	const workspaceName = 'my-workspace';
	const applicationId = 1;
	const applicationName = 'my-app';
	const collectionId = 1;
	const collectionName = 'my-collection';
	const collectionAttributeId = 1;
	const collectionAttributeName = 'my-collection-attribute';
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
		[collectionAttributePublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('collection_attribute', 'utf8'),
				collectionPublicKey.toBuffer(),
				new anchor.BN(collectionAttributeId).toArrayLike(Buffer, 'le', 4),
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
				await gatewayProgram.methods
					.createCollection(collectionId, collectionName)
					.accounts({
						collectionManagerProgram: collectionManagerProgram.programId,
						workspaceManagerProgram: workspaceManagerProgram.programId,
						userManagerProgram: userManagerProgram.programId,
						gateway: gatewayPublicKey,
						authority: provider.wallet.publicKey,
						workspace: workspacePublicKey,
						application: applicationPublicKey,
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
		const collectionAttributeRent =
			await provider.connection.getMinimumBalanceForRentExemption(141);
		// act
		await gatewayProgram.methods
			.createCollectionAttribute(
				collectionAttributeId,
				collectionAttributeName,
				0,
				null,
				null,
				null,
				null
			)
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
		const collectionAttributeAccount =
			await collectionManagerProgram.account.collectionAttribute.fetch(
				collectionAttributePublicKey
			);
		const budgetAfter = await provider.connection.getAccountInfo(
			budgetWalletPublicKey
		);
		assert.isTrue(
			collectionAttributeAccount.authority.equals(gatewayPublicKey)
		);
		assert.equal(collectionAttributeAccount.name, collectionAttributeName);
		assert.property(collectionAttributeAccount.kind, 'boolean');
		assert.equal((collectionAttributeAccount.kind as any)['boolean'].size, 1);
		assert.isNull(collectionAttributeAccount.modifier);
		assert.isTrue(collectionAttributeAccount.owner.equals(collectionPublicKey));
		assert.isTrue(
			collectionAttributeAccount.createdAt.eq(
				collectionAttributeAccount.updatedAt
			)
		);
		assert.isTrue(
			new anchor.BN(budgetBefore?.lamports ?? 0)
				.sub(new anchor.BN(collectionAttributeRent))
				.eq(new anchor.BN(budgetAfter?.lamports ?? 0))
		);
	});

	it('should update account', async () => {
		// arrange
		const name = 'attr2_name';
		const kind = 1;
		const modifier = 0;
		const size = 5;
		const max = 20;
		// act
		await gatewayProgram.methods
			.updateCollectionAttribute(name, kind, modifier, size, max, null)
			.accounts({
				workspaceManagerProgram: workspaceManagerProgram.programId,
				collectionManagerProgram: collectionManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				gateway: gatewayPublicKey,
				workspace: workspacePublicKey,
				application: applicationPublicKey,
				collection: collectionPublicKey,
				collectionAttribute: collectionAttributePublicKey,
			})
			.rpc();
		// assert
		const collectionAttributeAccount =
			await collectionManagerProgram.account.collectionAttribute.fetch(
				collectionAttributePublicKey
			);
		assert.equal(collectionAttributeAccount.name, name);
		assert.property(collectionAttributeAccount.kind, 'number');
		assert.equal((collectionAttributeAccount.kind as any)['number'].size, max);
		assert.property(collectionAttributeAccount.modifier, 'array');
		assert.equal(
			(collectionAttributeAccount.modifier as any)['array'].size,
			size
		);
		assert.ok(
			collectionAttributeAccount.createdAt.lte(
				collectionAttributeAccount.updatedAt
			)
		);
	});

	it('should delete account', async () => {
		// arrange
		const budgetBefore = await provider.connection.getAccountInfo(
			budgetWalletPublicKey
		);
		const collectionAttributeRent =
			await provider.connection.getMinimumBalanceForRentExemption(141);
		// act
		await gatewayProgram.methods
			.deleteCollectionAttribute()
			.accounts({
				workspaceManagerProgram: workspaceManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				collectionManagerProgram: collectionManagerProgram.programId,
				authority: provider.wallet.publicKey,
				gateway: gatewayPublicKey,
				workspace: workspacePublicKey,
				application: applicationPublicKey,
				collection: collectionPublicKey,
				collectionAttribute: collectionAttributePublicKey,
			})
			.rpc();
		// assert
		const collectionAttributeAccount =
			await collectionManagerProgram.account.collectionAttribute.fetchNullable(
				collectionAttributePublicKey
			);
		const budgetAfter = await provider.connection.getAccountInfo(
			budgetWalletPublicKey
		);
		assert.isNull(collectionAttributeAccount);
		assert.isTrue(
			new anchor.BN(budgetBefore?.lamports ?? 0)
				.add(new anchor.BN(collectionAttributeRent))
				.eq(new anchor.BN(budgetAfter?.lamports ?? 0))
		);
	});

	it('should fail when max is not provided with a number', async () => {
		// arrange
		const name = 'attr1_name';
		const kind = 1;
		const newCollectionId = 2;
		let error: AnchorError | null = null;
		// act
		try {
			await gatewayProgram.methods
				.createCollectionAttribute(
					newCollectionId,
					name,
					kind,
					null,
					null,
					null,
					null
				)
				.accounts({
					collectionManagerProgram: collectionManagerProgram.programId,
					workspaceManagerProgram: workspaceManagerProgram.programId,
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					gateway: gatewayPublicKey,
					workspace: workspacePublicKey,
					application: applicationPublicKey,
					collection: collectionPublicKey,
				})
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.code, 'InvalidAttributeKind');
	});

	it('should fail when max length is not provided with a string', async () => {
		// arrange
		const name = 'attr1_name';
		const kind = 2;
		const newCollectionId = 2;
		let error: AnchorError | null = null;
		// act
		try {
			await gatewayProgram.methods
				.createCollectionAttribute(
					newCollectionId,
					name,
					kind,
					null,
					null,
					null,
					null
				)
				.accounts({
					collectionManagerProgram: collectionManagerProgram.programId,
					workspaceManagerProgram: workspaceManagerProgram.programId,
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					gateway: gatewayPublicKey,
					workspace: workspacePublicKey,
					application: applicationPublicKey,
					collection: collectionPublicKey,
				})
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.code, 'InvalidAttributeKind');
	});

	it('should fail when providing wrong "collection" to delete', async () => {
		// arrange
		const newCollectionId = 2;
		const newCollectionName = 'sample';
		const [newCollectionPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('collection', 'utf8'),
				applicationPublicKey.toBuffer(),
				new anchor.BN(newCollectionId).toArrayLike(Buffer, 'le', 4),
			],
			collectionManagerProgram.programId
		);
		const newCollectionAttributeId = 2;
		const newCollectionAttributeName = 'attr1_name';
		const [newCollectionAttributePublicKey] =
			await PublicKey.findProgramAddress(
				[
					Buffer.from('collection_attribute', 'utf8'),
					newCollectionPublicKey.toBuffer(),
					new anchor.BN(newCollectionAttributeId).toArrayLike(Buffer, 'le', 4),
				],
				collectionManagerProgram.programId
			);
		let error: AnchorError | null = null;
		// act
		await gatewayProgram.methods
			.createCollection(newCollectionId, newCollectionName)
			.accounts({
				collectionManagerProgram: collectionManagerProgram.programId,
				workspaceManagerProgram: workspaceManagerProgram.programId,
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				gateway: gatewayPublicKey,
				workspace: workspacePublicKey,
				application: applicationPublicKey,
			})
			.postInstructions([
				await gatewayProgram.methods
					.createCollectionAttribute(
						newCollectionAttributeId,
						newCollectionAttributeName,
						0,
						null,
						null,
						null,
						null
					)
					.accounts({
						collectionManagerProgram: collectionManagerProgram.programId,
						workspaceManagerProgram: workspaceManagerProgram.programId,
						userManagerProgram: userManagerProgram.programId,
						authority: provider.wallet.publicKey,
						gateway: gatewayPublicKey,
						workspace: workspacePublicKey,
						application: applicationPublicKey,
						collection: newCollectionPublicKey,
					})
					.instruction(),
			])
			.rpc();
		try {
			await gatewayProgram.methods
				.deleteCollectionAttribute()
				.accounts({
					collectionManagerProgram: collectionManagerProgram.programId,
					workspaceManagerProgram: workspaceManagerProgram.programId,
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					gateway: gatewayPublicKey,
					workspace: workspacePublicKey,
					application: applicationPublicKey,
					collection: collectionPublicKey,
					collectionAttribute: newCollectionAttributePublicKey,
				})
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.code, 'InvalidCollection');
		assert.equal(error?.error.origin, 'collection');
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
		const [newCollectionPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('collection', 'utf8'),
				newApplicationPublicKey.toBuffer(),
				new anchor.BN(newCollectionId).toArrayLike(Buffer, 'le', 4),
			],
			collectionManagerProgram.programId
		);
		const newCollectionAttributeId = 3;
		const newCollectionAttributeName = 'sample';
		let error: AnchorError | null = null;
		const initialDeposit =
			(await provider.connection.getMinimumBalanceForRentExemption(130)) +
			(await provider.connection.getMinimumBalanceForRentExemption(157));
		// act
		await gatewayProgram.methods
			.createWorkspace(
				newWorkspaceId,
				newWorkspaceName,
				new anchor.BN(initialDeposit)
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
					.instruction(),
			])
			.rpc();
		try {
			await gatewayProgram.methods
				.createCollectionAttribute(
					newCollectionAttributeId,
					newCollectionAttributeName,
					0,
					null,
					null,
					null,
					null
				)
				.accounts({
					collectionManagerProgram: collectionManagerProgram.programId,
					workspaceManagerProgram: workspaceManagerProgram.programId,
					userManagerProgram: userManagerProgram.programId,
					gateway: gatewayPublicKey,
					authority: provider.wallet.publicKey,
					workspace: newWorkspacePublicKey,
					application: newApplicationPublicKey,
					collection: newCollectionPublicKey,
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
		const newCollectionAttributeId = 4;
		const newCollectionAttributeName = 'sample';
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
				.createCollectionAttribute(
					newCollectionAttributeId,
					newCollectionAttributeName,
					0,
					null,
					null,
					null,
					null
				)
				.accounts({
					collectionManagerProgram: collectionManagerProgram.programId,
					workspaceManagerProgram: workspaceManagerProgram.programId,
					userManagerProgram: userManagerProgram.programId,
					gateway: gatewayPublicKey,
					authority: newUser.publicKey,
					workspace: workspacePublicKey,
					application: applicationPublicKey,
					collection: collectionPublicKey,
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
