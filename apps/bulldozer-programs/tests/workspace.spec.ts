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

describe('workspace', () => {
	const provider = AnchorProvider.env();
	anchor.setProvider(provider);
	const bulldozerProgram = anchor.workspace.Bulldozer as Program<Bulldozer>;
	const userManagerProgram = anchor.workspace
		.UserManager as Program<UserManager>;
	const workspace = Keypair.generate();
	const newUser = Keypair.generate();
	let userPublicKey: PublicKey;
	let newUserPublicKey: PublicKey;
	let budgetPublicKey: PublicKey;
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
		[budgetPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('budget', 'utf8'), workspace.publicKey.toBuffer()],
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
		// act
		await bulldozerProgram.methods
			.createWorkspace({
				name: workspaceName,
			})
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
			})
			.postInstructions([
				SystemProgram.transfer({
					fromPubkey: provider.wallet.publicKey,
					toPubkey: budgetPublicKey,
					lamports: LAMPORTS_PER_SOL,
				}),
			])
			.signers([workspace])
			.rpc();
		// assert
		const account = await bulldozerProgram.account.workspace.fetch(
			workspace.publicKey
		);
		assert.ok(account.authority.equals(provider.wallet.publicKey));
		assert.equal(account.name, workspaceName);
		assert.ok(account.createdAt.eq(account.updatedAt));
	});

	it('should update account', async () => {
		// arrange
		const workspaceName = 'my-app2';
		// act
		await bulldozerProgram.methods
			.updateWorkspace({ name: workspaceName })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
			})
			.rpc();
		// assert
		const account = await bulldozerProgram.account.workspace.fetch(
			workspace.publicKey
		);
		assert.ok(account.createdAt.lte(account.updatedAt));
		assert.equal(account.name, workspaceName);
	});

	it('should delete account', async () => {
		// act
		await bulldozerProgram.methods
			.deleteWorkspace()
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
			})
			.rpc();
		// assert
		const account = await bulldozerProgram.account.workspace.fetchNullable(
			workspace.publicKey
		);
		assert.equal(account, null);
	});

	it('should fail when deleting workspace with applications', async () => {
		// arrange
		const newWorkspaceName = 'sample';
		const newWorkspace = Keypair.generate();
		const applicationName = 'sample';
		const application = Keypair.generate();
		const [newBudgetPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('budget', 'utf8'), newWorkspace.publicKey.toBuffer()],
			bulldozerProgram.programId
		);
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.deleteWorkspace()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: newWorkspace.publicKey,
				})
				.preInstructions([
					await bulldozerProgram.methods
						.createWorkspace({
							name: newWorkspaceName,
						})
						.accounts({
							userManagerProgram: userManagerProgram.programId,
							// This is temporal since anchor doesn't populate pda from a defined type argument
							workspace: newWorkspace.publicKey,
							authority: provider.wallet.publicKey,
							user: userPublicKey,
						})
						.instruction(),
					SystemProgram.transfer({
						fromPubkey: provider.wallet.publicKey,
						toPubkey: newBudgetPublicKey,
						lamports: LAMPORTS_PER_SOL,
					}),
					await bulldozerProgram.methods
						.createApplication({ name: applicationName })
						.accounts({
							userManagerProgram: userManagerProgram.programId,
							authority: provider.wallet.publicKey,
							workspace: newWorkspace.publicKey,
							application: application.publicKey,
						})
						.instruction(),
				])
				.signers([application, newWorkspace])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6024);
	});

	it('should fail when deleting workspace with collaborators', async () => {
		// arrange
		const newWorkspaceName = 'sample';
		const newWorkspace = Keypair.generate();
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.createWorkspace({
					name: newWorkspaceName,
				})
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					workspace: newWorkspace.publicKey,
					authority: provider.wallet.publicKey,
				})
				.postInstructions([
					await bulldozerProgram.methods
						.createCollaborator()
						.accounts({
							userManagerProgram: userManagerProgram.programId,
							workspace: newWorkspace.publicKey,
							user: newUserPublicKey,
							authority: provider.wallet.publicKey,
						})
						.instruction(),
				])
				.signers([newWorkspace])
				.rpc();
			await bulldozerProgram.methods
				.deleteWorkspace()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: newWorkspace.publicKey,
				})
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6025);
	});

	it('should fail when user is not a collaborator', async () => {
		// arrange
		const newWorkspaceName = 'sample';
		const newUser = Keypair.generate();
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.updateWorkspace({ name: newWorkspaceName })
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: newUser.publicKey,
					workspace: workspace.publicKey,
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
		assert.equal(error?.error.errorCode.number, 3012);
	});

	it('should fail when user is not an admin collaborator', async () => {
		// arrange
		const newWorkspace = Keypair.generate();
		const newWorkspaceName = 'sample';
		const newUser = Keypair.generate();
		let error: AnchorError | null = null;
		// act
		const [newUserPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('user', 'utf8'), newUser.publicKey.toBuffer()],
			userManagerProgram.programId
		);

		try {
			await bulldozerProgram.methods
				.updateWorkspace({ name: newWorkspaceName })
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: newUser.publicKey,
					workspace: newWorkspace.publicKey,
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
						.createWorkspace({
							name: newWorkspaceName,
						})
						.accounts({
							userManagerProgram: userManagerProgram.programId,
							authority: provider.wallet.publicKey,
							workspace: newWorkspace.publicKey,
						})
						.instruction(),
					await bulldozerProgram.methods
						.requestCollaboratorStatus()
						.accounts({
							userManagerProgram: userManagerProgram.programId,
							authority: newUser.publicKey,
							user: newUserPublicKey,
							workspace: newWorkspace.publicKey,
						})
						.instruction(),
				])
				.signers([newUser, newWorkspace])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6045);
	});
});
