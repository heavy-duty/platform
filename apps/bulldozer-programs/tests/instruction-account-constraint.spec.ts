import { AnchorProvider, Program } from '@heavy-duty/anchor';
import {
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
	SystemProgram,
} from '@solana/web3.js';
import { assert } from 'chai';
import { Bulldozer, IDL } from '../target/types/bulldozer';
import { BULLDOZER_PROGRAM_ID } from './utils';

describe('instruction account constraint', () => {
	const provider = AnchorProvider.env();
	const program = new Program<Bulldozer>(IDL, BULLDOZER_PROGRAM_ID, provider);
	const instruction = Keypair.generate();
	const instructionName = 'create_document';
	const collection = Keypair.generate();
	const collectionName = 'things';
	const collectionAttribute = Keypair.generate();
	const collectionAttributeName = 'another-things';
	const instructionAccount = Keypair.generate();
	const instructionAccountName = 'data';
	const instructionAccountConstraint = Keypair.generate();
	const application = Keypair.generate();
	const applicationName = 'my-app';
	const workspace = Keypair.generate();
	const workspaceName = 'my-workspace';
	let budgetPublicKey: PublicKey;
	const userUserName = 'user-name-1';
	const userName = 'User Name 1';
	const userThumbnailUrl = 'https://img/1.com';

	before(async () => {
		[budgetPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('budget', 'utf8'), workspace.publicKey.toBuffer()],
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
			.createCollection({ name: collectionName })
			.accounts({
				collection: collection.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				authority: provider.wallet.publicKey,
			})
			.signers([collection])
			.rpc();
		await program.methods
			.createCollectionAttribute({
				name: collectionAttributeName,
				kind: 0,
				modifier: null,
				max: null,
				maxLength: null,
				size: null,
			})
			.accounts({
				attribute: collectionAttribute.publicKey,
				collection: collection.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				authority: provider.wallet.publicKey,
			})
			.signers([collectionAttribute])
			.rpc();
		await program.methods
			.createInstructionAccount({
				name: instructionAccountName,
				kind: 0,
				modifier: null,
				space: null,
				uncheckedExplanation: null,
			})
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				account: instructionAccount.publicKey,
			})
			.postInstructions([
				await program.methods
					.setInstructionAccountCollection()
					.accounts({
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						application: application.publicKey,
						instruction: instruction.publicKey,
						collection: collection.publicKey,
						account: instructionAccount.publicKey,
					})
					.instruction(),
			])
			.signers([instructionAccount])
			.rpc();
	});

	it('should create', async () => {
		// arrange
		const instructionAccountConstraintName = 'constraint';
		const instructionAccountConstraintBody = '<your-condition>';
		// act
		await program.methods
			.createInstructionAccountConstraint({
				name: instructionAccountConstraintName,
				body: instructionAccountConstraintBody,
			})
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				account: instructionAccount.publicKey,
				accountConstraint: instructionAccountConstraint.publicKey,
			})
			.signers([instructionAccountConstraint])
			.rpc();
		// assert
		const constraintAccount =
			await program.account.instructionAccountConstraint.fetch(
				instructionAccountConstraint.publicKey
			);
		assert.equal(constraintAccount.name, instructionAccountConstraintName);
		assert.equal(constraintAccount.body, instructionAccountConstraintBody);
		assert.isTrue(
			constraintAccount.account.equals(instructionAccount.publicKey)
		);
	});

	it('should update', async () => {
		// arrange
		const instructionAccountConstraintName = 'constraint2';
		const instructionAccountConstraintBody = '<your-condition2>';
		// act
		await program.methods
			.updateInstructionAccountConstraint({
				name: instructionAccountConstraintName,
				body: instructionAccountConstraintBody,
			})
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				account: instructionAccount.publicKey,
				accountConstraint: instructionAccountConstraint.publicKey,
			})
			.rpc();
		// assert
		const constraintAccount =
			await program.account.instructionAccountConstraint.fetch(
				instructionAccountConstraint.publicKey
			);
		assert.equal(constraintAccount.name, instructionAccountConstraintName);
		assert.equal(constraintAccount.body, instructionAccountConstraintBody);
	});

	it('should delete', async () => {
		// act
		await program.methods
			.deleteInstructionAccountConstraint()
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				instruction: instruction.publicKey,
				account: instructionAccount.publicKey,
				accountConstraint: instructionAccountConstraint.publicKey,
			})
			.rpc();
		// assert
		const constraintAccount =
			await program.account.instructionAccountConstraint.fetchNullable(
				instructionAccountConstraint.publicKey
			);
		assert.isNull(constraintAccount);
	});
});
