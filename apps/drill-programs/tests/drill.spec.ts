import { AnchorError, AnchorProvider, BN, Program } from '@heavy-duty/anchor';
import { getAccount } from '@solana/spl-token';
import { Keypair, PublicKey } from '@solana/web3.js';
import { assert } from 'chai';
import { Drill, IDL } from '../target/types/drill';
import {
	createAssociatedTokenAccount,
	createFundedWallet,
	createMint,
	DRILL_PROGRAM_ID,
	mintTo,
} from './utils';

describe('drill', () => {
	const provider = AnchorProvider.env();
	const program = new Program<Drill>(IDL, DRILL_PROGRAM_ID, provider);
	const boardId = 1;
	const bountyId = 2;
	let boardPublicKey: PublicKey;
	let bountyPublicKey: PublicKey;
	let bountyVaultPublicKey: PublicKey;
	let acceptedMintPublicKey: PublicKey;
	let user1Keypair: Keypair;
	let user1AssociatedTokenAccount: PublicKey;
	const user1Balance = 500;
	const user2Name = 'user2';
	let user2Keypair: Keypair;
	let user2AssociatedTokenAccount: PublicKey;
	const user2Balance = 25;
	const bountyTotal = new BN(100);

	before(async () => {
		[boardPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('board', 'utf8'),
				new BN(boardId).toArrayLike(Buffer, 'le', 4),
			],
			program.programId
		);
		[bountyPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('bounty', 'utf8'),
				boardPublicKey.toBuffer(),
				new BN(bountyId).toArrayLike(Buffer, 'le', 4),
			],
			program.programId
		);
		[bountyVaultPublicKey] = await PublicKey.findProgramAddress(
			[Buffer.from('bounty_vault', 'utf8'), bountyPublicKey.toBuffer()],
			program.programId
		);

		acceptedMintPublicKey = await createMint(provider);
		user1Keypair = await createFundedWallet(provider);
		user2Keypair = await createFundedWallet(provider);

		user1AssociatedTokenAccount = await createAssociatedTokenAccount(
			provider,
			acceptedMintPublicKey,
			user1Keypair
		);
		user2AssociatedTokenAccount = await createAssociatedTokenAccount(
			provider,
			acceptedMintPublicKey,
			user2Keypair
		);

		await mintTo(
			provider,
			acceptedMintPublicKey,
			user1Balance,
			user1AssociatedTokenAccount
		);
		await mintTo(
			provider,
			acceptedMintPublicKey,
			user2Balance,
			user2AssociatedTokenAccount
		);
	});

	it('should initialize board', async () => {
		// act
		await program.methods
			.initializeBoard(boardId, new BN(0))
			.accounts({
				acceptedMint: acceptedMintPublicKey,
				authority: user1Keypair.publicKey,
			})
			.signers([user1Keypair])
			.rpc();
		// assert
		const boardAccount = await program.account.board.fetchNullable(
			boardPublicKey
		);
		assert.notEqual(boardAccount, null);
		assert.ok(boardAccount.authority.equals(user1Keypair.publicKey));
	});

	it('should initialize bounty', async () => {
		// act
		await program.methods
			.initializeBounty(boardId, bountyId)
			.accounts({
				acceptedMint: acceptedMintPublicKey,
				authority: user1Keypair.publicKey,
			})
			.signers([user1Keypair])
			.rpc();
		// assert
		const bountyAccount = await program.account.bounty.fetchNullable(
			bountyPublicKey
		);
		assert.notEqual(bountyAccount, null);
		assert.equal(bountyAccount.isClosed, false);
	});

	it('should deposit into bounty', async () => {
		// act
		await program.methods
			.deposit(boardId, bountyId, bountyTotal)
			.accounts({
				authority: user1Keypair.publicKey,
				sponsorVault: user1AssociatedTokenAccount,
			})
			.signers([user1Keypair])
			.rpc();
		// assert
		const bountyVaultAccount = await getAccount(
			provider.connection,
			bountyVaultPublicKey
		);
		const sponsorVaultAccount = await getAccount(
			provider.connection,
			user1AssociatedTokenAccount
		);
		assert.equal(
			bountyVaultAccount.amount,
			BigInt(`0x${bountyTotal.toString('hex')}`)
		);
		assert.equal(
			sponsorVaultAccount.amount,
			BigInt(user1Balance) - BigInt(`0x${bountyTotal.toString('hex')}`)
		);
	});

	it('should close bounty', async () => {
		// act
		await program.methods
			.closeBounty(boardId, bountyId, user2Name)
			.accounts({ authority: user1Keypair.publicKey })
			.signers([user1Keypair])
			.rpc();
		// assert
		const bountyAccount = await program.account.bounty.fetchNullable(
			bountyPublicKey
		);
		assert.equal(bountyAccount.isClosed, true);
		assert.notEqual(bountyAccount.bountyHunter, null);
		assert.equal(bountyAccount.bountyHunter, user2Name);
	});

	it('should send bounty', async () => {
		// act
		await program.methods
			.sendBounty(boardId, bountyId, user2Name)
			.accounts({
				authority: user2Keypair.publicKey,
				userVault: user2AssociatedTokenAccount,
				boardAuthority: user1Keypair.publicKey,
			})
			.signers([user2Keypair])
			.rpc();
		// assert
		const bountyAccount = await program.account.bounty.fetchNullable(
			bountyPublicKey
		);
		const userVaultAccount = await getAccount(
			provider.connection,
			user2AssociatedTokenAccount
		);
		const bountyVaultAccount = await provider.connection.getAccountInfo(
			bountyVaultPublicKey
		);
		assert.equal(bountyAccount, null);
		assert.equal(bountyVaultAccount, null);
		assert.equal(
			userVaultAccount.amount,
			BigInt(user2Balance) + BigInt(`0x${bountyTotal.toString('hex')}`)
		);
	});

	it('should set a new authority', async () => {
		// arrange
		const boardId = 5;
		[boardPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('board', 'utf8'),
				new BN(boardId).toArrayLike(Buffer, 'le', 4),
			],
			program.programId
		);
		// act
		await program.methods
			.initializeBoard(boardId, new BN(1_000_000))
			.accounts({
				acceptedMint: acceptedMintPublicKey,
				authority: user1Keypair.publicKey,
			})
			.signers([user1Keypair])
			.rpc();
		const signature = await program.methods
			.setBoardAuthority(boardId)
			.accounts({
				authority: user1Keypair.publicKey,
				newAuthority: user2Keypair.publicKey,
			})
			.signers([user1Keypair])
			.rpc();
		await provider.connection.confirmTransaction(signature);
		// assert
		const boardAccount = await program.account.board.fetchNullable(
			boardPublicKey
		);
		assert.ok(boardAccount.authority.equals(user2Keypair.publicKey));
	});

	it('should fail sending bounty before lock', async () => {
		// arrange
		const boardId = 10;
		const bountyId = 11;
		let error: AnchorError;
		// act
		await program.methods
			.initializeBoard(boardId, new BN(1_000_000_000))
			.accounts({
				acceptedMint: acceptedMintPublicKey,
				authority: user1Keypair.publicKey,
			})
			.signers([user1Keypair])
			.rpc();
		await program.methods
			.initializeBounty(boardId, bountyId)
			.accounts({
				acceptedMint: acceptedMintPublicKey,
				authority: user1Keypair.publicKey,
			})
			.signers([user1Keypair])
			.rpc();
		await program.methods
			.closeBounty(boardId, bountyId, user2Name)
			.accounts({ authority: user1Keypair.publicKey })
			.signers([user1Keypair])
			.rpc();
		try {
			await program.methods
				.sendBounty(boardId, bountyId, user2Name)
				.accounts({
					authority: user2Keypair.publicKey,
					userVault: user2AssociatedTokenAccount,
					boardAuthority: user1Keypair.publicKey,
				})
				.signers([user2Keypair])
				.rpc();
		} catch (err) {
			error = err;
		}
		// assert
		assert.equal(error.error.errorMessage, 'BountyLockedError');
	});
});
