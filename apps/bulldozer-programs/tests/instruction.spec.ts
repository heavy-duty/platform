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

describe('instruction', () => {
	const provider = AnchorProvider.env();
	anchor.setProvider(provider);
	const bulldozerProgram = anchor.workspace.Bulldozer as Program<Bulldozer>;
	const userManagerProgram = anchor.workspace
		.UserManager as Program<UserManager>;
	const instruction = Keypair.generate();
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
		const instructionName = 'create_document';
		// act
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
		// assert
		const account = await bulldozerProgram.account.instruction.fetch(
			instruction.publicKey
		);
		const applicationStatsAccount =
			await bulldozerProgram.account.applicationStats.fetch(
				applicationStatsPublicKey
			);
		assert.ok(account.authority.equals(provider.wallet.publicKey));
		assert.equal(account.name, instructionName);
		assert.equal(account.body, '');
		assert.ok(account.workspace.equals(workspace.publicKey));
		assert.ok(account.application.equals(application.publicKey));
		assert.equal(applicationStatsAccount.quantityOfInstructions, 1);
		assert.ok(account.createdAt.eq(account.updatedAt));
	});

	it('should update account', async () => {
		// arrange
		const instructionName = 'update_document';
		// act
		await bulldozerProgram.methods
			.updateInstruction({ name: instructionName })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
			})
			.rpc();
		// assert
		const account = await bulldozerProgram.account.instruction.fetch(
			instruction.publicKey
		);
		assert.equal(account.name, instructionName);
		assert.ok(account.createdAt.lte(account.updatedAt));
	});

	it('should update instruction body', async () => {
		// arrange
		const instructionBody = `
      msg!("Create instruction argument");
      ctx.accounts.argument.name = name;
      ctx.accounts.argument.kind = AttributeKind::from_index(kind)?;
      ctx.accounts.argument.modifier = AttributeKindModifier::from_index(modifier, size)?;
      ctx.accounts.argument.authority = ctx.accounts.authority.key();
      ctx.accounts.argument.instruction = ctx.accounts.instruction.key();
      ctx.accounts.argument.application = ctx.accounts.application.key();
    `;
		// act
		await bulldozerProgram.methods
			.updateInstructionBody({ body: instructionBody })
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
			})
			.rpc();
		// assert
		const account = await bulldozerProgram.account.instruction.fetch(
			instruction.publicKey
		);
		assert.equal(account.body, instructionBody);
	});

	it('should delete account', async () => {
		// act
		await bulldozerProgram.methods
			.deleteInstruction()
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				instruction: instruction.publicKey,
				application: application.publicKey,
			})
			.rpc();
		// assert
		const account = await bulldozerProgram.account.instruction.fetchNullable(
			instruction.publicKey
		);
		const applicationStatsAccount =
			await bulldozerProgram.account.applicationStats.fetch(
				applicationStatsPublicKey
			);
		assert.equal(account, null);
		assert.equal(applicationStatsAccount.quantityOfInstructions, 0);
	});

	it('should fail when deleting instruction with arguments', async () => {
		// arrange
		const instructionName = 'sample';
		const instruction = Keypair.generate();
		const argument = Keypair.generate();
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
				.createInstructionArgument(argumentsData)
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					argument: argument.publicKey,
				})
				.signers([argument])
				.rpc();
			await bulldozerProgram.methods
				.deleteInstruction()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
				})
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6016);
	});

	it('should fail when deleting instruction with accounts', async () => {
		// arrange
		const instructionName = 'sample';
		const instruction = Keypair.generate();
		const account = Keypair.generate();
		const argumentsData = {
			name: 'data',
			kind: 1,
			modifier: null,
			space: null,
		};
		let error: AnchorError | null = null;
		// act
		try {
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
				.createInstructionAccount(argumentsData)
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					account: account.publicKey,
				})
				.signers([account])
				.rpc();
			await bulldozerProgram.methods
				.deleteInstruction()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
				})
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6018);
	});

	it('should fail when providing wrong "application" to delete', async () => {
		// arrange
		const newApplication = Keypair.generate();
		const newApplicationName = 'sample';
		const newInstruction = Keypair.generate();
		const newInstructionName = 'sample';
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.createApplication({ name: newApplicationName })
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: newApplication.publicKey,
				})
				.signers([newApplication])
				.rpc();
			await bulldozerProgram.methods
				.createInstruction({ name: newInstructionName })
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: newApplication.publicKey,
					instruction: newInstruction.publicKey,
				})
				.signers([newInstruction])
				.rpc();
			await bulldozerProgram.methods
				.deleteInstruction()
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: newInstruction.publicKey,
				})
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6039);
	});

	it('should fail when workspace has insufficient funds', async () => {
		// arrange
		const newWorkspace = Keypair.generate();
		const newWorkspaceName = 'sample';
		const newApplication = Keypair.generate();
		const newApplicationName = 'sample';
		const newInstruction = Keypair.generate();
		const newInstructionName = 'sample';
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
						(await bulldozerProgram.provider.connection.getMinimumBalanceForRentExemption(
							126 // application account size
						)) +
						(await bulldozerProgram.provider.connection.getMinimumBalanceForRentExemption(
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
		try {
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
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6027);
	});

	it('should fail when user is not a collaborator', async () => {
		// arrange
		const newInstruction = Keypair.generate();
		const newInstructionName = 'sample';
		const newUser = Keypair.generate();
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.createInstruction({ name: newInstructionName })
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: newUser.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: newInstruction.publicKey,
				})
				.signers([newUser, newInstruction])
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
		const newInstruction = Keypair.generate();
		const newInstructionName = 'sample';
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

		try {
			await bulldozerProgram.methods
				.createInstruction({ name: newInstructionName })
				.accounts({
					userManagerProgram: userManagerProgram.programId,
					authority: newUser.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: newInstruction.publicKey,
				})
				.signers([newUser, newInstruction])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6029);
	});
});
