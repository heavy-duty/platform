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

describe('instruction argument', () => {
	const provider = AnchorProvider.env();
	anchor.setProvider(provider);
	const bulldozerProgram = anchor.workspace.Bulldozer as Program<Bulldozer>;
	const userManagerProgram = anchor.workspace
		.UserManager as Program<UserManager>;
	const instruction = Keypair.generate();
	const instructionArgument = Keypair.generate();
	const instructionName = 'create_document';
	const application = Keypair.generate();
	const workspace = Keypair.generate();
	const applicationName = 'my-app';
	const workspaceName = 'my-workspace';
	let budgetPublicKey: PublicKey;
	let instructionStatsPublicKey: PublicKey;
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
		[instructionStatsPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('instruction_stats', 'utf8'),
				instruction.publicKey.toBuffer(),
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
	});

	it('should create account', async () => {
		// arrange
		const argumentsData = {
			name: 'attr1_name',
			kind: 0,
			modifier: null,
			size: null,
			max: null,
			maxLength: null,
		};
		// act
		await bulldozerProgram.methods
			.createInstructionArgument(argumentsData)
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				argument: instructionArgument.publicKey,
			})
			.signers([instructionArgument])
			.rpc();
		// assert
		const instructionArgumentAccount =
			await bulldozerProgram.account.instructionArgument.fetch(
				instructionArgument.publicKey
			);
		const instructionStatsAccount =
			await bulldozerProgram.account.instructionStats.fetch(
				instructionStatsPublicKey
			);
		const decodedKind = decodeAttributeEnum(
			instructionArgumentAccount.kind as any
		);
		assert.ok(
			instructionArgumentAccount.authority.equals(provider.wallet.publicKey)
		);
		assert.ok(instructionArgumentAccount.workspace.equals(workspace.publicKey));
		assert.ok(
			instructionArgumentAccount.application.equals(application.publicKey)
		);
		assert.ok(
			instructionArgumentAccount.instruction.equals(instruction.publicKey)
		);
		assert.equal(instructionArgumentAccount.name, argumentsData.name);
		assert.equal(decodedKind.name, 'boolean');
		assert.equal(decodedKind.id, argumentsData.kind);
		assert.equal(decodedKind.size, 1);
		assert.equal(instructionArgumentAccount.modifier, null);
		assert.equal(instructionStatsAccount.quantityOfArguments, 1);
		assert.ok(
			instructionArgumentAccount.createdAt.eq(
				instructionArgumentAccount.updatedAt
			)
		);
	});

	it('should update account', async () => {
		// arrange
		const argumentsData = {
			name: 'attr1_name',
			kind: 1,
			modifier: 0,
			size: 5,
			max: 10,
			maxLength: null,
		};
		// act
		await bulldozerProgram.methods
			.updateInstructionArgument(argumentsData)
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				instruction: instruction.publicKey,
				argument: instructionArgument.publicKey,
			})
			.rpc();
		// assert
		const account = await bulldozerProgram.account.instructionArgument.fetch(
			instructionArgument.publicKey
		);
		const decodedKind = decodeAttributeEnum(account.kind as any);
		const decodedModifier = decodeAttributeEnum(account.modifier as any);
		assert.equal(account.name, argumentsData.name);
		assert.equal(decodedKind.id, argumentsData.kind);
		assert.equal(decodedKind.name, 'number');
		assert.equal(decodedKind.size, argumentsData.max);
		assert.equal(decodedModifier.id, argumentsData.modifier);
		assert.equal(decodedModifier.name, 'array');
		assert.equal(decodedModifier.size, argumentsData.size);
		assert.ok(account.createdAt.lte(account.updatedAt));
	});

	it('should delete account', async () => {
		// act
		await bulldozerProgram.methods
			.deleteInstructionArgument()
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				argument: instructionArgument.publicKey,
				instruction: instruction.publicKey,
			})
			.rpc();
		// assert
		const argumentAccount =
			await bulldozerProgram.account.instructionArgument.fetchNullable(
				instructionArgument.publicKey
			);
		const instructionStatsAccount =
			await bulldozerProgram.account.instructionStats.fetch(
				instructionStatsPublicKey
			);
		assert.equal(argumentAccount, null);
		assert.equal(instructionStatsAccount.quantityOfArguments, 0);
	});

	it('should fail when max is not provided with a number', async () => {
		// arrange
		const argumentsData = {
			name: 'attr1_name',
			kind: 1,
			modifier: 0,
			size: null,
			max: null,
			maxLength: null,
		};
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.createInstructionArgument(argumentsData)
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					argument: instructionArgument.publicKey,
				})
				.signers([instructionArgument])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6011);
	});

	it('should fail when max length is not provided with a string', async () => {
		// arrange
		const argumentsData = {
			name: 'attr1_name',
			kind: 2,
			modifier: 0,
			size: null,
			max: null,
			maxLength: null,
		};
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.createInstructionArgument(argumentsData)
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					argument: instructionArgument.publicKey,
				})
				.signers([instructionArgument])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6012);
	});

	it('should fail when providing wrong "instruction" to delete', async () => {
		// arrange
		const newInstruction = Keypair.generate();
		const newInstructionName = 'sample';
		const newArgument = Keypair.generate();
		const argumentsData = {
			name: 'arg1_name',
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
				.createInstruction({ name: newInstructionName })
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: newInstruction.publicKey,
				})
				.signers([newInstruction])
				.rpc();
			await bulldozerProgram.methods
				.createInstructionArgument(argumentsData)
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: newInstruction.publicKey,
					argument: newArgument.publicKey,
				})
				.signers([newArgument])
				.rpc();
			await bulldozerProgram.methods
				.deleteInstructionArgument()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					instruction: instruction.publicKey,
					argument: newArgument.publicKey,
				})
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6041);
	});

	it('should fail when workspace has insufficient funds', async () => {
		// arrange
		const newWorkspace = Keypair.generate();
		const newWorkspaceName = 'sample';
		const newApplication = Keypair.generate();
		const newApplicationName = 'sample';
		const newInstruction = Keypair.generate();
		const newInstructionName = 'sample';
		const newArgument = Keypair.generate();
		const argumentsData = {
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
		try {
			await bulldozerProgram.methods
				.createInstructionArgument(argumentsData)
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: newWorkspace.publicKey,
					application: newApplication.publicKey,
					instruction: newInstruction.publicKey,
					argument: newArgument.publicKey,
				})
				.signers([newArgument])
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
		const newArgument = Keypair.generate();
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
		try {
			await bulldozerProgram.methods
				.createInstructionArgument(argumentsData)
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: newUser.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					argument: newArgument.publicKey,
				})
				.signers([newUser, newArgument])
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
		const newArgument = Keypair.generate();
		const argumentsData = {
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
		const [newUserPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('user', 'utf8'), newUser.publicKey.toBuffer()],
			bulldozerProgram.programId
		);
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

		try {
			await bulldozerProgram.methods
				.createInstructionArgument(argumentsData)
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: newUser.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					argument: newArgument.publicKey,
				})
				.signers([newUser, newArgument])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6029);
	});
});
