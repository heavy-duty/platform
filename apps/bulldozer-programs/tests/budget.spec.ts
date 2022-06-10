import * as anchor from '@heavy-duty/anchor';
import { AnchorError, AnchorProvider, BN, Program } from '@heavy-duty/anchor';
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
	let budgetPublicKey: PublicKey;
	const userUserName = 'user-name-1';
	const userName = 'User Name 1';
	const userThumbnailUrl = 'https://img/1.com';
	const newUserUserName = 'user-name-2';
	const newUserName = 'User Name 2';
	const newUserThumbnailUrl = 'https://img/2.com';
	const workspaceName = 'my-app';

	before(async () => {
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

		await bulldozerProgram.methods
			.createWorkspace({
				name: workspaceName,
			})
			.accounts({
				userManagerProgram: userManagerProgram.programId,
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
			})
			.signers([workspace])
			.rpc();

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

	it('should deposit to budget', async () => {
		// arrange
		const amount = new BN(LAMPORTS_PER_SOL);
		const budgetBefore = await provider.connection.getAccountInfo(
			budgetPublicKey
		);
		// act
		await bulldozerProgram.methods
			.depositToBudget({
				amount,
			})
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
			})
			.rpc();
		// assert
		const budgetAfter = await provider.connection.getAccountInfo(
			budgetPublicKey
		);
		const budget = await bulldozerProgram.account.budget.fetch(budgetPublicKey);
		assert.ok(
			new BN(budgetBefore?.lamports ?? 0)
				.add(amount)
				.eq(new BN(budgetAfter?.lamports ?? 0))
		);
		assert.ok(budget.totalDeposited.eq(amount));
		assert.ok(budget.totalValueLocked.eq(amount));
	});

	it('should when withdrawing unauthorized', async () => {
		// arrange
		const amount = new BN(LAMPORTS_PER_SOL);
		let error: AnchorError | null = null;
		// act
		try {
			await bulldozerProgram.methods
				.withdrawFromBudget({
					amount,
				})
				.accounts({
					authority: newUser.publicKey,
					workspace: workspace.publicKey,
				})
				.signers([newUser])
				.rpc();
		} catch (err) {
			error = err as AnchorError;
		}
		// assert
		assert.equal(error?.error.errorCode.number, 6050);
	});

	it('should withdraw from budget', async () => {
		// arrange
		const amount = new BN(LAMPORTS_PER_SOL);
		const budgetBefore = await provider.connection.getAccountInfo(
			budgetPublicKey
		);
		// act
		await bulldozerProgram.methods
			.withdrawFromBudget({
				amount,
			})
			.accounts({
				authority: provider.wallet.publicKey,
				workspace: workspace.publicKey,
			})
			.rpc();
		// assert
		const budgetAfter = await provider.connection.getAccountInfo(
			budgetPublicKey
		);
		const budget = await bulldozerProgram.account.budget.fetch(budgetPublicKey);
		assert.ok(
			new BN(budgetBefore?.lamports ?? 0)
				.sub(amount)
				.eq(new BN(budgetAfter?.lamports ?? 0))
		);
		assert.ok(budget.totalDeposited.eq(amount));
		assert.ok(budget.totalValueLocked.eq(new BN(0)));
	});
});
