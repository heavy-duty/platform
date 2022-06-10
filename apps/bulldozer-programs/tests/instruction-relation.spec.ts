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

describe('instruction relation', () => {
	const provider = AnchorProvider.env();
	anchor.setProvider(provider);
	const bulldozerProgram = anchor.workspace.Bulldozer as Program<Bulldozer>;
	const userManagerProgram = anchor.workspace
		.UserManager as Program<UserManager>;
	const instruction = Keypair.generate();
	const instructionName = 'create_document';
	const application = Keypair.generate();
	const applicationName = 'my-app';
	const workspace = Keypair.generate();
	const workspaceName = 'my-app';
	const from = Keypair.generate();
	const fromDto = {
		name: 'from',
		kind: 1,
		modifier: null,
		space: null,
	};
	const to = Keypair.generate();
	const toDto = {
		name: 'to',
		kind: 1,
		modifier: null,
		space: null,
	};
	let relationPublicKey: PublicKey;
	let budgetPublicKey: PublicKey;
	let fromStatsPublicKey: PublicKey;
	let toStatsPublicKey: PublicKey;
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
		[relationPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('instruction_relation', 'utf8'),
				from.publicKey.toBuffer(),
				to.publicKey.toBuffer(),
			],
			bulldozerProgram.programId
		);
		[fromStatsPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('instruction_account_stats', 'utf8'),
				from.publicKey.toBuffer(),
			],
			bulldozerProgram.programId
		);
		[toStatsPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('instruction_account_stats', 'utf8'),
				to.publicKey.toBuffer(),
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
			.createInstruction({ name: instructionName })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
			})
			.signers([instruction])
			.rpc();
		await bulldozerProgram.methods
			.createInstructionAccount(fromDto)
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				account: from.publicKey,
			})
			.signers([from])
			.rpc();
		await bulldozerProgram.methods
			.createInstructionAccount(toDto)
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				account: to.publicKey,
			})
			.signers([to])
			.rpc();
	});

	it('should create', async () => {
		// act
		await bulldozerProgram.methods
			.createInstructionRelation()
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				from: from.publicKey,
				to: to.publicKey,
			})
			.rpc();
		// assert
		const instructionRelationAccount =
			await bulldozerProgram.account.instructionRelation.fetch(
				relationPublicKey
			);
		const fromStatsAccount =
			await bulldozerProgram.account.instructionAccountStats.fetch(
				fromStatsPublicKey
			);
		const toStatsAccount =
			await bulldozerProgram.account.instructionAccountStats.fetch(
				toStatsPublicKey
			);
		assert.ok(
			instructionRelationAccount.authority.equals(provider.wallet.publicKey)
		);
		assert.ok(
			instructionRelationAccount.instruction.equals(instruction.publicKey)
		);
		assert.ok(instructionRelationAccount.workspace.equals(workspace.publicKey));
		assert.ok(
			instructionRelationAccount.application.equals(application.publicKey)
		);
		assert.ok(instructionRelationAccount.from.equals(from.publicKey));
		assert.ok(instructionRelationAccount.to.equals(to.publicKey));
		assert.equal(fromStatsAccount.quantityOfRelations, 1);
		assert.equal(toStatsAccount.quantityOfRelations, 1);
		assert.ok(
			instructionRelationAccount.createdAt.eq(
				instructionRelationAccount.updatedAt
			)
		);
	});

	it('should delete', async () => {
		const newFrom = Keypair.generate();
		const newTo = Keypair.generate();
		// act
		await bulldozerProgram.methods
			.createInstructionAccount(fromDto)
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				account: newFrom.publicKey,
			})
			.signers([newFrom])
			.rpc();
		await bulldozerProgram.methods
			.createInstructionAccount(toDto)
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				account: newTo.publicKey,
			})
			.signers([newTo])
			.rpc();
		const [newRelationPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('instruction_relation', 'utf8'),
				newFrom.publicKey.toBuffer(),
				newTo.publicKey.toBuffer(),
			],
			bulldozerProgram.programId
		);
		await bulldozerProgram.methods
			.createInstructionRelation()
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				from: newFrom.publicKey,
				to: newTo.publicKey,
			})
			.rpc();
		await bulldozerProgram.methods
			.deleteInstructionRelation()
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				instruction: instruction.publicKey,
				from: newFrom.publicKey,
				to: newTo.publicKey,
			})
			.rpc();
		// assert
		const instructionRelationAccount =
			await bulldozerProgram.account.instructionRelation.fetchNullable(
				newRelationPublicKey
			);
		assert.equal(instructionRelationAccount, null);
	});

	it('should fail if from and to are equal', async () => {
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.createInstructionRelation()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					from: from.publicKey,
					to: from.publicKey,
				})
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 2003);
	});

	it('should fail when workspace has insufficient funds', async () => {
		// arrange
		const newWorkspace = Keypair.generate();
		const newWorkspaceName = 'sample';
		const newApplication = Keypair.generate();
		const newApplicationName = 'sample';
		const newInstruction = Keypair.generate();
		const newInstructionName = 'sample';
		const newFrom = Keypair.generate();
		const newTo = Keypair.generate();
		const [newBudgetPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('budget', 'utf8'), newWorkspace.publicKey.toBuffer()],
			bulldozerProgram.programId
		);
		let error: AnchorError | null = null;
		// act
		await bulldozerProgram.methods
			.createWorkspace({ name: newWorkspaceName })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: newWorkspace.publicKey,
			})
			.signers([newWorkspace])
			.postInstructions([
				SystemProgram.transfer({
					fromPubkey: provider.wallet.publicKey,
					toPubkey: newBudgetPublicKey,
					lamports:
						(await provider.connection.getMinimumBalanceForRentExemption(
							2155 // instruction account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							10 // instruction stats account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							125 // application account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							10 // application stats account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							264 // from account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							10 // from stats account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							41 // from collection account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							41 // from close account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							41 // from payer account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							264 // to account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							10 // to stats account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							41 // from collection account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							41 // from close account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							41 // from payer account size
						)),
				}),
			])
			.rpc();
		await bulldozerProgram.methods
			.createApplication({ name: newApplicationName })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: newWorkspace.publicKey,
				application: newApplication.publicKey,
			})
			.signers([newApplication])
			.rpc();
		await bulldozerProgram.methods
			.createInstruction({ name: newInstructionName })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: newWorkspace.publicKey,
				application: newApplication.publicKey,
				instruction: newInstruction.publicKey,
			})
			.signers([newInstruction])
			.rpc();
		await bulldozerProgram.methods
			.createInstructionAccount(fromDto)
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: newWorkspace.publicKey,
				application: newApplication.publicKey,
				instruction: newInstruction.publicKey,
				account: newFrom.publicKey,
			})
			.signers([newFrom])
			.rpc();
		await bulldozerProgram.methods
			.createInstructionAccount(toDto)
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: newWorkspace.publicKey,
				application: newApplication.publicKey,
				instruction: newInstruction.publicKey,
				account: newTo.publicKey,
			})
			.signers([newTo])
			.rpc();
		try {
			await bulldozerProgram.methods
				.createInstructionRelation()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: newWorkspace.publicKey,
					application: newApplication.publicKey,
					instruction: newInstruction.publicKey,
					from: newFrom.publicKey,
					to: newTo.publicKey,
				})
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
		const newFrom = Keypair.generate();
		const newTo = Keypair.generate();
		let error: AnchorError | null = null;
		// act
		await bulldozerProgram.methods
			.createInstructionAccount(fromDto)
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				account: newFrom.publicKey,
			})
			.signers([newFrom])
			.rpc();
		await bulldozerProgram.methods
			.createInstructionAccount(toDto)
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				account: newTo.publicKey,
			})
			.signers([newTo])
			.rpc();
		try {
			await bulldozerProgram.methods
				.createInstructionRelation()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: newUser.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					from: newFrom.publicKey,
					to: newTo.publicKey,
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

	it('should fail when user is not an approved collaborator', async () => {
		// arrange
		const newFrom = Keypair.generate();
		const newTo = Keypair.generate();
		const newUser = Keypair.generate();
		let error: AnchorError | null = null;
		// act
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
		await bulldozerProgram.methods
			.requestCollaboratorStatus()
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: newUser.publicKey,
				workspace: workspace.publicKey,
			})
			.signers([newUser])
			.rpc();
		await bulldozerProgram.methods
			.createInstructionAccount(fromDto)
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				account: newFrom.publicKey,
			})
			.signers([newFrom])
			.rpc();
		await bulldozerProgram.methods
			.createInstructionAccount(toDto)
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				account: newTo.publicKey,
			})
			.signers([newTo])
			.rpc();

		try {
			await bulldozerProgram.methods
				.createInstructionRelation()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: newUser.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					from: newFrom.publicKey,
					to: newTo.publicKey,
				})
				.signers([newUser])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6029);
	});
});
