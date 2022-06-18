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

describe('instruction', () => {
	const provider = AnchorProvider.env();
	const program = new Program<Bulldozer>(IDL, BULLDOZER_PROGRAM_ID, provider);
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
			program.programId
		);
		[applicationStatsPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('application_stats', 'utf8'),
				application.publicKey.toBuffer(),
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
	});

	it('should create account', async () => {
		// arrange
		const instructionName = 'create_document';
		// act
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
		// assert
		const account = await program.account.instruction.fetch(
			instruction.publicKey
		);
		const applicationStatsAccount =
			await program.account.applicationStats.fetch(applicationStatsPublicKey);
		assert.ok(account.authority.equals(provider.wallet.publicKey));
		assert.equal(account.name, instructionName);
		assert.ok(account.workspace.equals(workspace.publicKey));
		assert.ok(account.application.equals(application.publicKey));
		assert.equal(applicationStatsAccount.quantityOfInstructions, 1);
		assert.ok(account.createdAt.eq(account.updatedAt));
	});

	it('should update account', async () => {
		// arrange
		const instructionName = 'update_document';
		// act
		await program.methods
			.updateInstruction({ name: instructionName })
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
			})
			.rpc();
		// assert
		const account = await program.account.instruction.fetch(
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
		await program.methods
			.updateInstructionBody({ chunk: 0, body: instructionBody })
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
			})
			.rpc();
		// assert
		const account = await program.account.instruction.fetch(
			instruction.publicKey
		);
		const body = (account.chunks as any).reduce(
			(chunks: string, chunk: any) => chunks + chunk.data,
			''
		);
		assert.equal(body, instructionBody);
	});

	it('should delete account', async () => {
		// act
		await program.methods
			.deleteInstruction()
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				instruction: instruction.publicKey,
				application: application.publicKey,
			})
			.rpc();
		// assert
		const account = await program.account.instruction.fetchNullable(
			instruction.publicKey
		);
		const applicationStatsAccount =
			await program.account.applicationStats.fetch(applicationStatsPublicKey);
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
				.createInstructionArgument(argumentsData)
				.accounts({
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					argument: argument.publicKey,
				})
				.signers([argument])
				.rpc();
			await program.methods
				.deleteInstruction()
				.accounts({
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
			uncheckedExplanation: null,
		};
		let error: AnchorError | null = null;
		// act
		try {
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
				.createInstructionAccount(argumentsData)
				.accounts({
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					account: account.publicKey,
				})
				.signers([account])
				.rpc();
			await program.methods
				.deleteInstruction()
				.accounts({
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
			await program.methods
				.createApplication({ name: newApplicationName })
				.accounts({
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: newApplication.publicKey,
				})
				.signers([newApplication])
				.rpc();
			await program.methods
				.createInstruction({ name: newInstructionName })
				.accounts({
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: newApplication.publicKey,
					instruction: newInstruction.publicKey,
				})
				.signers([newInstruction])
				.rpc();
			await program.methods
				.deleteInstruction()
				.accounts({
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
						(await program.provider.connection.getMinimumBalanceForRentExemption(
							126 // application account size
						)) +
						(await program.provider.connection.getMinimumBalanceForRentExemption(
							10 // application stats account size
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
		try {
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
			await program.methods
				.createInstruction({ name: newInstructionName })
				.accounts({
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
				workspace: workspace.publicKey,
				user: newUserPublicKey,
			})
			.signers([newUser])
			.rpc();

		try {
			await program.methods
				.createInstruction({ name: newInstructionName })
				.accounts({
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
