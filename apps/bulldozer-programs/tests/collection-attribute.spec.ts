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
import { decodeAttributeEnum } from './utils';

describe('collection attribute', () => {
	const provider = AnchorProvider.env();
	anchor.setProvider(provider);
	const bulldozerProgram = anchor.workspace.Bulldozer as Program<Bulldozer>;
	const userManagerProgram = anchor.workspace
		.UserManager as Program<UserManager>;
	const attribute = Keypair.generate();
	const collection = Keypair.generate();
	const application = Keypair.generate();
	const workspace = Keypair.generate();
	const applicationName = 'my-app';
	const workspaceName = 'my-workspace';
	const collectionName = 'my-collection';
	let collectionStatsPublicKey: PublicKey;
	let budgetPublicKey: PublicKey;
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
		[collectionStatsPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('collection_stats', 'utf8'),
				collection.publicKey.toBuffer(),
			],
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

		await bulldozerProgram.methods
			.createApplication({ name: applicationName })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
			})
			.signers([application])
			.rpc();

		await bulldozerProgram.methods
			.createCollection({ name: collectionName })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				collection: collection.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				authority: provider.wallet.publicKey,
			})
			.signers([collection])
			.rpc();
	});

	it('should create account', async () => {
		// arrange
		const attributesData = {
			name: 'attr1_name',
			kind: 0,
			modifier: null,
			size: null,
			max: null,
			maxLength: null,
		};
		// act
		await bulldozerProgram.methods
			.createCollectionAttribute(attributesData)
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				collection: collection.publicKey,
				attribute: attribute.publicKey,
			})
			.signers([attribute])
			.rpc();
		// assert
		const collectionAttributeAccount =
			await bulldozerProgram.account.collectionAttribute.fetch(
				attribute.publicKey
			);
		const collectionStatsAccount =
			await bulldozerProgram.account.collectionStats.fetch(
				collectionStatsPublicKey
			);
		const decodedKind = decodeAttributeEnum(
			collectionAttributeAccount.kind as any
		);
		assert.ok(
			collectionAttributeAccount.authority.equals(provider.wallet.publicKey)
		);
		assert.equal(collectionAttributeAccount.name, attributesData.name);
		assert.equal(decodedKind.id, attributesData.kind);
		assert.equal(collectionAttributeAccount.modifier, null);
		assert.ok(
			collectionAttributeAccount.collection?.equals(collection.publicKey)
		);
		assert.ok(
			collectionAttributeAccount.application.equals(application.publicKey)
		);
		assert.ok(collectionAttributeAccount.workspace.equals(workspace.publicKey));
		assert.equal(collectionStatsAccount.quantityOfAttributes, 1);
		assert.ok(
			collectionAttributeAccount.createdAt.eq(
				collectionAttributeAccount.updatedAt
			)
		);
	});

	it('should update account', async () => {
		// arrange
		const attributesData = {
			name: 'attr2_name',
			kind: 1,
			modifier: 0,
			size: 5,
			max: 20,
			maxLength: null,
		};
		// act
		await bulldozerProgram.methods
			.updateCollectionAttribute(attributesData)
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				collection: collection.publicKey,
				attribute: attribute.publicKey,
			})
			.rpc();
		// assert
		const account = await bulldozerProgram.account.collectionAttribute.fetch(
			attribute.publicKey
		);
		const decodedKind = decodeAttributeEnum(account.kind as any);
		const decodedModifier = decodeAttributeEnum(account.modifier as any);
		assert.equal(account.name, attributesData.name);
		assert.equal(decodedKind.id, attributesData.kind);
		assert.equal(decodedKind.name, 'number');
		assert.equal(decodedKind.size, attributesData.max);
		assert.equal(decodedModifier.id, attributesData.modifier);
		assert.equal(decodedModifier.name, 'array');
		assert.equal(decodedModifier.size, attributesData.size);
		assert.ok(account.createdAt.lte(account.updatedAt));
	});

	it('should delete account', async () => {
		// act
		await bulldozerProgram.methods
			.deleteCollectionAttribute()
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				collection: collection.publicKey,
				attribute: attribute.publicKey,
			})
			.rpc();
		// assert
		const collectionAttributeAccount =
			await bulldozerProgram.account.collectionAttribute.fetchNullable(
				attribute.publicKey
			);
		const collectionStatsAccount =
			await bulldozerProgram.account.collectionStats.fetch(
				collectionStatsPublicKey
			);
		assert.equal(collectionAttributeAccount, null);
		assert.equal(collectionStatsAccount.quantityOfAttributes, 0);
	});

	it('should fail when max is not provided with a number', async () => {
		// arrange
		const attributesData = {
			name: 'attr1_name',
			kind: 1,
			modifier: null,
			size: null,
			max: null,
			maxLength: null,
		};
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.createCollectionAttribute(attributesData)
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					collection: collection.publicKey,
					attribute: attribute.publicKey,
				})
				.signers([attribute])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6011);
	});

	it('should fail when max length is not provided with a string', async () => {
		// arrange
		const attributesData = {
			name: 'attr1_name',
			kind: 2,
			modifier: null,
			size: null,
			max: null,
			maxLength: null,
		};
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.createCollectionAttribute(attributesData)
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					collection: collection.publicKey,
					attribute: attribute.publicKey,
				})
				.signers([attribute])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6012);
	});

	it('should fail when providing wrong "collection" to delete', async () => {
		// arrange
		const newCollection = Keypair.generate();
		const newCollectionName = 'sample';
		const newAttribute = Keypair.generate();
		const attributesData = {
			name: 'attr1_name',
			kind: 0,
			modifier: null,
			size: null,
			max: null,
			maxLength: null,
		};
		let error: AnchorError | null = null;
		// act
		await bulldozerProgram.methods
			.createCollection({ name: newCollectionName })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				collection: newCollection.publicKey,
			})
			.postInstructions([
				await bulldozerProgram.methods
					.createCollectionAttribute(attributesData)
					.accounts({
						userManagerProgram: userManagerProgram.programId,
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						application: application.publicKey,
						collection: newCollection.publicKey,
						attribute: newAttribute.publicKey,
					})
					.instruction(),
			])
			.signers([newCollection, newAttribute])
			.rpc();
		try {
			await bulldozerProgram.methods
				.deleteCollectionAttribute()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					collection: collection.publicKey,
					attribute: newAttribute.publicKey,
				})
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6037);
	});

	it('should fail when workspace has insufficient funds', async () => {
		// arrange
		const newWorkspace = Keypair.generate();
		const newWorkspaceName = 'sample';
		const newApplication = Keypair.generate();
		const newApplicationName = 'sample';
		const newCollection = Keypair.generate();
		const newCollectionName = 'sample';
		const newAttribute = Keypair.generate();
		const attributesData = {
			name: 'attr1_name',
			kind: 0,
			modifier: null,
			size: null,
			max: null,
			maxLength: null,
		};
		const [newBudgetPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('budget', 'utf8'), newWorkspace.publicKey.toBuffer()],
			bulldozerProgram.programId
		);
		let error: AnchorError | null = null;
		// act
		await bulldozerProgram.methods
			.createCollection({ name: newCollectionName })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: newWorkspace.publicKey,
				application: newApplication.publicKey,
				collection: newCollection.publicKey,
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
				SystemProgram.transfer({
					fromPubkey: provider.wallet.publicKey,
					toPubkey: newBudgetPublicKey,
					lamports:
						(await provider.connection.getMinimumBalanceForRentExemption(
							157 // collection account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							9 // collection stats account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							125 // application account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							10 // application stats account size
						)),
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
			.signers([newWorkspace, newApplication, newCollection])
			.rpc();
		try {
			await bulldozerProgram.methods
				.createCollectionAttribute(attributesData)
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: newWorkspace.publicKey,
					application: newApplication.publicKey,
					collection: newCollection.publicKey,
					attribute: newAttribute.publicKey,
				})
				.signers([newAttribute])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6027);
	});

	it('should fail when user is not a collaborator', async () => {
		// arrange
		const newUser = Keypair.generate();
		const newAttribute = Keypair.generate();
		const attributesData = {
			name: 'attr1_name',
			kind: 0,
			modifier: null,
			size: null,
			max: null,
			maxLength: null,
		};
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.createCollectionAttribute(attributesData)
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: newUser.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					collection: collection.publicKey,
					attribute: newAttribute.publicKey,
				})
				.signers([newUser, newAttribute])
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
		const newAttribute = Keypair.generate();
		const attributesData = {
			name: 'attr1_name',
			kind: 0,
			modifier: null,
			size: null,
			max: null,
			maxLength: null,
		};
		const newUser = Keypair.generate();
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.createCollectionAttribute(attributesData)
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: newUser.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					collection: collection.publicKey,
					attribute: newAttribute.publicKey,
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
					await bulldozerProgram.methods
						.requestCollaboratorStatus()
						.accounts({
							userManagerProgram: userManagerProgram.programId,
							authority: newUser.publicKey,
							workspace: workspace.publicKey,
						})
						.instruction(),
				])
				.signers([newUser, newAttribute])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6029);
	});
});
