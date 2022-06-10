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

describe('collection', () => {
	const provider = AnchorProvider.env();
	anchor.setProvider(provider);
	const bulldozerProgram = anchor.workspace.Bulldozer as Program<Bulldozer>;
	const userManagerProgram = anchor.workspace
		.UserManager as Program<UserManager>;
	const collection = Keypair.generate();
	const application = Keypair.generate();
	const workspace = Keypair.generate();
	const applicationName = 'my-app';
	const workspaceName = 'my-workspace';
	let budgetPublicKey: PublicKey;
	let applicationStatsPublicKey: PublicKey;
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
		[applicationStatsPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('application_stats', 'utf8'),
				application.publicKey.toBuffer(),
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
	});

	it('should create account', async () => {
		// arrange
		const collectionName = 'things';
		// act
		await bulldozerProgram.methods
			.createCollection({ name: collectionName })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				collection: collection.publicKey,
				application: application.publicKey,
				workspace: workspace.publicKey,
				authority: provider.wallet.publicKey,
			})
			.signers([collection])
			.rpc();
		// assert
		const account = await bulldozerProgram.account.collection.fetch(
			collection.publicKey
		);
		const applicationStatsAccount =
			await bulldozerProgram.account.applicationStats.fetch(
				applicationStatsPublicKey
			);
		assert.ok(account.authority.equals(provider.wallet.publicKey));
		assert.ok(account.workspace.equals(workspace.publicKey));
		assert.ok(account.application.equals(application.publicKey));
		assert.equal(account.name, collectionName);
		assert.equal(applicationStatsAccount.quantityOfCollections, 1);
		assert.ok(account.createdAt.eq(account.updatedAt));
	});

	it('should update account', async () => {
		// arrange
		const collectionName = 'things2';
		// act
		await bulldozerProgram.methods
			.updateCollection({ name: collectionName })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				collection: collection.publicKey,
			})
			.rpc();
		// assert
		const account = await bulldozerProgram.account.collection.fetch(
			collection.publicKey
		);
		assert.equal(account.name, collectionName);
		assert.ok(account.createdAt.lte(account.updatedAt));
	});

	it('should delete account', async () => {
		// act
		await bulldozerProgram.methods
			.deleteCollection()
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				collection: collection.publicKey,
			})
			.rpc();
		// assert
		const account = await bulldozerProgram.account.collection.fetchNullable(
			collection.publicKey
		);
		const applicationStatsAccount =
			await bulldozerProgram.account.applicationStats.fetch(
				applicationStatsPublicKey
			);
		assert.equal(account, null);
		assert.equal(applicationStatsAccount.quantityOfCollections, 0);
	});

	it('should fail when deleting collection with attributes', async () => {
		// arrange
		const collectionName = 'sample';
		const collection = Keypair.generate();
		const attribute = Keypair.generate();
		const argumentsData = {
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
			.createCollection({ name: collectionName })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				collection: collection.publicKey,
			})
			.postInstructions([
				await bulldozerProgram.methods
					.createCollectionAttribute(argumentsData)
					.accounts({
						userManagerProgram: userManagerProgram.programId,
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						application: application.publicKey,
						collection: collection.publicKey,
						attribute: attribute.publicKey,
					})
					.instruction(),
			])
			.signers([collection, attribute])
			.rpc();
		try {
			await bulldozerProgram.methods
				.deleteCollection()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					collection: collection.publicKey,
				})
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6013);
	});

	it('should fail when providing wrong "application" to delete', async () => {
		// arrange
		const newApplication = Keypair.generate();
		const newApplicationName = 'sample';
		const newCollection = Keypair.generate();
		const newCollectionName = 'sample';
		let error: AnchorError | null = null;
		// act
		await bulldozerProgram.methods
			.createApplication({ name: newApplicationName })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: newApplication.publicKey,
			})
			.postInstructions([
				await bulldozerProgram.methods
					.createCollection({ name: newCollectionName })
					.accounts({
						userManagerProgram: userManagerProgram.programId,
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						application: newApplication.publicKey,
						collection: newCollection.publicKey,
					})
					.instruction(),
			])
			.signers([newApplication, newCollection])
			.rpc();
		try {
			await bulldozerProgram.methods
				.deleteCollection()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					collection: newCollection.publicKey,
				})
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6035);
	});

	it('should fail when workspace has insufficient funds', async () => {
		// arrange
		const newWorkspace = Keypair.generate();
		const newWorkspaceName = 'sample';
		const newApplication = Keypair.generate();
		const newApplicationName = 'sample';
		const newCollection = Keypair.generate();
		const newCollectionName = 'sample';
		const [newBudgetPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('budget', 'utf8'), newWorkspace.publicKey.toBuffer()],
			bulldozerProgram.programId
		);
		let error: AnchorError | null = null;
		// act
		try {
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
						.signers([newWorkspace])
						.instruction(),
					SystemProgram.transfer({
						fromPubkey: provider.wallet.publicKey,
						toPubkey: newBudgetPublicKey,
						lamports:
							(await bulldozerProgram.provider.connection.getMinimumBalanceForRentExemption(
								125 // application account size
							)) +
							(await bulldozerProgram.provider.connection.getMinimumBalanceForRentExemption(
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
						.signers([newApplication])
						.instruction(),
				])
				.signers([newWorkspace, newApplication, newCollection])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6027);
	});

	it('should fail when user is not a collaborator', async () => {
		// arrange
		const newCollection = Keypair.generate();
		const newCollectionName = 'sample';
		const newUser = Keypair.generate();
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.createCollection({ name: newCollectionName })
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: newUser.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					collection: newCollection.publicKey,
				})
				.signers([newUser, newCollection])
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
		const newCollection = Keypair.generate();
		const newCollectionName = 'sample';
		const newUser = Keypair.generate();
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.createCollection({ name: newCollectionName })
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: newUser.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					collection: newCollection.publicKey,
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
				.signers([newUser, newCollection])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6029);
	});
});
