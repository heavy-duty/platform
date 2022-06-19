import { AnchorError, AnchorProvider, Program } from '@heavy-duty/anchor';
import {
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
	SystemProgram,
} from '@solana/web3.js';
import { assert } from 'chai';
import { Bulldozer, IDL } from '../target/types/bulldozer';
import { BULLDOZER_PROGRAM_ID } from './utils';

describe('instruction relation', () => {
	const provider = AnchorProvider.env();
	const program = new Program<Bulldozer>(IDL, BULLDOZER_PROGRAM_ID, provider);
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
		uncheckedExplanation: null,
	};
	const to = Keypair.generate();
	const toDto = {
		name: 'to',
		kind: 1,
		modifier: null,
		space: null,
		uncheckedExplanation: null,
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
			program.programId
		);
		[relationPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('instruction_relation', 'utf8'),
				from.publicKey.toBuffer(),
				to.publicKey.toBuffer(),
			],
			program.programId
		);
		[fromStatsPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('instruction_account_stats', 'utf8'),
				from.publicKey.toBuffer(),
			],
			program.programId
		);
		[toStatsPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('instruction_account_stats', 'utf8'),
				to.publicKey.toBuffer(),
			],
			program.programId
		);

		try {
			await program.methods
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

		await program.methods
			.createWorkspace({ name: workspaceName })
			.accounts({
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
		await program.methods
			.createApplication({ name: applicationName })
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
			})
			.signers([application])
			.rpc();
		await program.methods
			.createInstruction({ name: instructionName })
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
			})
			.signers([instruction])
			.rpc();
		await program.methods
			.createInstructionAccount(fromDto)
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				account: from.publicKey,
			})
			.signers([from])
			.rpc();
		await program.methods
			.createInstructionAccount(toDto)
			.accounts({
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
		await program.methods
			.createInstructionRelation()
			.accounts({
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
			await program.account.instructionRelation.fetch(relationPublicKey);
		const fromStatsAccount =
			await program.account.instructionAccountStats.fetch(fromStatsPublicKey);
		const toStatsAccount = await program.account.instructionAccountStats.fetch(
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
		await program.methods
			.createInstructionAccount(fromDto)
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				account: newFrom.publicKey,
			})
			.signers([newFrom])
			.rpc();
		await program.methods
			.createInstructionAccount(toDto)
			.accounts({
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
			program.programId
		);
		await program.methods
			.createInstructionRelation()
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				from: newFrom.publicKey,
				to: newTo.publicKey,
			})
			.rpc();
		await program.methods
			.deleteInstructionRelation()
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				instruction: instruction.publicKey,
				from: newFrom.publicKey,
				to: newTo.publicKey,
			})
			.rpc();
		// assert
		const instructionRelationAccount =
			await program.account.instructionRelation.fetchNullable(
				newRelationPublicKey
			);
		assert.equal(instructionRelationAccount, null);
	});

	it('should fail if from and to are equal', async () => {
		let error: AnchorError | null = null;
		// act
		try {
			await program.methods
				.createInstructionRelation()
				.accounts({
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
			program.programId
		);
		let error: AnchorError | null = null;
		// act
		await program.methods
			.createWorkspace({ name: newWorkspaceName })
			.accounts({
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
							462 // from derivation account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							264 // to account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							10 // to stats account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							41 // to collection account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							41 // to close account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							41 // to payer account size
						)) +
						(await provider.connection.getMinimumBalanceForRentExemption(
							462 // to derivation account size
						)),
				}),
			])
			.rpc();
		await program.methods
			.createApplication({ name: newApplicationName })
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: newWorkspace.publicKey,
				application: newApplication.publicKey,
			})
			.signers([newApplication])
			.rpc();
		await program.methods
			.createInstruction({ name: newInstructionName })
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: newWorkspace.publicKey,
				application: newApplication.publicKey,
				instruction: newInstruction.publicKey,
			})
			.signers([newInstruction])
			.rpc();
		await program.methods
			.createInstructionAccount(fromDto)
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: newWorkspace.publicKey,
				application: newApplication.publicKey,
				instruction: newInstruction.publicKey,
				account: newFrom.publicKey,
			})
			.signers([newFrom])
			.rpc();
		await program.methods
			.createInstructionAccount(toDto)
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: newWorkspace.publicKey,
				application: newApplication.publicKey,
				instruction: newInstruction.publicKey,
				account: newTo.publicKey,
			})
			.signers([newTo])
			.rpc();
		try {
			await program.methods
				.createInstructionRelation()
				.accounts({
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
		await program.methods
			.createInstructionAccount(fromDto)
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				account: newFrom.publicKey,
			})
			.signers([newFrom])
			.rpc();
		await program.methods
			.createInstructionAccount(toDto)
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				account: newTo.publicKey,
			})
			.signers([newTo])
			.rpc();
		try {
			await program.methods
				.createInstructionRelation()
				.accounts({
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
		const [newUserPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('user', 'utf8'), newUser.publicKey.toBuffer()],
			program.programId
		);
		await program.methods
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
		await program.methods
			.requestCollaboratorStatus()
			.accounts({
				authority: newUser.publicKey,
				user: newUserPublicKey,
				workspace: workspace.publicKey,
			})
			.signers([newUser])
			.rpc();
		await program.methods
			.createInstructionAccount(fromDto)
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				account: newFrom.publicKey,
			})
			.signers([newFrom])
			.rpc();
		await program.methods
			.createInstructionAccount(toDto)
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				account: newTo.publicKey,
			})
			.signers([newTo])
			.rpc();

		try {
			await program.methods
				.createInstructionRelation()
				.accounts({
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
