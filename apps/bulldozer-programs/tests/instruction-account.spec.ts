import { AnchorError, AnchorProvider, Program } from '@heavy-duty/anchor';
import {
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
	SystemProgram,
} from '@solana/web3.js';
import { assert } from 'chai';
import { Bulldozer, IDL } from '../target/types/bulldozer';
import {
	BULLDOZER_PROGRAM_ID,
	decodeAccountKind,
	decodeAccountModifier,
} from './utils';

describe('instruction account', () => {
	const provider = AnchorProvider.env();
	const program = new Program<Bulldozer>(IDL, BULLDOZER_PROGRAM_ID, provider);
	const instruction = Keypair.generate();
	const instructionName = 'create_document';
	const collection = Keypair.generate();
	const collectionName = 'things';
	const anotherCollection = Keypair.generate();
	const anotherCollectionName = 'another-things';
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
			program.programId
		);
		[instructionStatsPublicKey] = await PublicKey.findProgramAddress(
			[
				Buffer.from('instruction_stats', 'utf8'),
				instruction.publicKey.toBuffer(),
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
			.createCollection({ name: anotherCollectionName })
			.accounts({
				collection: anotherCollection.publicKey,
				workspace: workspace.publicKey,
				application: application.publicKey,
				authority: provider.wallet.publicKey,
			})
			.signers([anotherCollection])
			.rpc();
	});

	describe('document', () => {
		const instructionAccount = Keypair.generate();

		it('should create', async () => {
			// arrange
			const accountsData = {
				name: 'data',
				kind: 0,
				modifier: null,
				space: null,
				uncheckedExplanation: null,
			};
			// act
			await program.methods
				.createInstructionAccount(accountsData)
				.accounts({
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					account: instructionAccount.publicKey,
				})
				.signers([instructionAccount])
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
				.rpc();
			// assert
			const account = await program.account.instructionAccount.fetch(
				instructionAccount.publicKey
			);
			const instructionAccountCollectionPublicKey =
				await PublicKey.createProgramAddress(
					[
						Buffer.from('instruction_account_collection', 'utf8'),
						instructionAccount.publicKey.toBuffer(),
						Buffer.from([account.bumps.collection]),
					],
					program.programId
				);
			const instructionAccountCollection =
				await program.account.instructionAccountCollection.fetch(
					instructionAccountCollectionPublicKey
				);
			const instructionStatsAccount =
				await program.account.instructionStats.fetch(instructionStatsPublicKey);
			const decodedKind = decodeAccountKind(account.kind as any);
			assert.ok(account.authority.equals(provider.wallet.publicKey));
			assert.ok(account.instruction.equals(instruction.publicKey));
			assert.ok(account.workspace.equals(workspace.publicKey));
			assert.ok(account.application.equals(application.publicKey));
			assert.equal(account.name, accountsData.name);
			assert.ok('document' in account.kind);
			assert.equal(decodedKind.id, accountsData.kind);
			assert.equal(account.modifier, null);
			assert.ok(account.createdAt.eq(account.updatedAt));
			assert.equal(instructionStatsAccount.quantityOfAccounts, 1);
			assert.ok(
				instructionAccountCollection.collection?.equals(collection.publicKey)
			);
		});

		it('should delete', async () => {
			// arrange
			const instructionAccount = Keypair.generate();
			const accountsData = {
				name: 'data',
				kind: 0,
				modifier: null,
				space: null,
				uncheckedExplanation: null,
			};
			// act
			await program.methods
				.createInstructionAccount(accountsData)
				.accounts({
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					account: instructionAccount.publicKey,
				})
				.signers([instructionAccount])
				.rpc();
			await program.methods
				.deleteInstructionAccount()
				.accounts({
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					account: instructionAccount.publicKey,
					instruction: instruction.publicKey,
				})
				.rpc();
			// assert
			const account = await program.account.instructionAccount.fetchNullable(
				instructionAccount.publicKey
			);
			assert.equal(account, null);
		});

		describe('with init modifier', () => {
			const instructionAccount = Keypair.generate();
			const instructionPayerAccount = Keypair.generate();

			before(async () => {
				const accountsData = {
					name: 'payer',
					kind: 1,
					modifier: 1,
					space: null,
					uncheckedExplanation: null,
				};

				await program.methods
					.createInstructionAccount(accountsData)
					.accounts({
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						application: application.publicKey,
						instruction: instruction.publicKey,
						account: instructionPayerAccount.publicKey,
					})
					.signers([instructionPayerAccount])
					.rpc();
			});

			it('should create', async () => {
				// arrange
				const accountsData = {
					name: 'data',
					kind: 0,
					modifier: 0,
					space: 150,
					uncheckedExplanation: null,
				};
				// act
				await program.methods
					.createInstructionAccount(accountsData)
					.accounts({
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						application: application.publicKey,
						instruction: instruction.publicKey,
						account: instructionAccount.publicKey,
					})
					.signers([instructionAccount])
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
						await program.methods
							.setInstructionAccountPayer()
							.accounts({
								authority: provider.wallet.publicKey,
								workspace: workspace.publicKey,
								instruction: instruction.publicKey,
								payer: instructionPayerAccount.publicKey,
								account: instructionAccount.publicKey,
							})
							.instruction(),
					])
					.rpc();
				// assert
				const account = await program.account.instructionAccount.fetch(
					instructionAccount.publicKey
				);
				const instructionAccountPayerPublicKey =
					await PublicKey.createProgramAddress(
						[
							Buffer.from('instruction_account_payer', 'utf8'),
							instructionAccount.publicKey.toBuffer(),
							Buffer.from([account.bumps.payer]),
						],
						program.programId
					);
				const instructionAccountPayer =
					await program.account.instructionAccountPayer.fetch(
						instructionAccountPayerPublicKey
					);
				const decodedModifier = decodeAccountModifier(account.modifier as any);
				assert.equal(decodedModifier.id, accountsData.modifier);
				assert.equal(decodedModifier.name, 'init');
				assert.equal(account.space, 150);
				assert.ok(
					instructionAccountPayer.payer?.equals(
						instructionPayerAccount.publicKey
					)
				);
			});

			it('should remove payer and space when changing the modifier', async () => {
				// arrange
				const accountsData = {
					name: 'data',
					kind: 0,
					modifier: null,
					space: null,
					uncheckedExplanation: null,
				};
				// act
				await program.methods
					.updateInstructionAccount(accountsData)
					.accounts({
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						instruction: instruction.publicKey,
						account: instructionAccount.publicKey,
					})
					.rpc();
				// assert
				const account = await program.account.instructionAccount.fetch(
					instructionAccount.publicKey
				);
				const instructionAccountPayerPublicKey =
					await PublicKey.createProgramAddress(
						[
							Buffer.from('instruction_account_payer', 'utf8'),
							instructionAccount.publicKey.toBuffer(),
							Buffer.from([account.bumps.payer]),
						],
						program.programId
					);
				const instructionAccountPayer =
					await program.account.instructionAccountPayer.fetch(
						instructionAccountPayerPublicKey
					);
				assert.equal(account.modifier, null);
				assert.equal(account.space, null);
				assert.equal(instructionAccountPayer.payer, null);
			});

			it('should fail when space is not provided', async () => {
				// arrange
				const instructionAccount = Keypair.generate();
				const accountsData = {
					name: 'data',
					kind: 0,
					modifier: 0,
					space: null,
					uncheckedExplanation: null,
				};
				let error: AnchorError | null = null;
				// act
				try {
					await program.methods
						.createInstructionAccount(accountsData)
						.accounts({
							authority: provider.wallet.publicKey,
							workspace: workspace.publicKey,
							application: application.publicKey,
							instruction: instruction.publicKey,
							account: instructionAccount.publicKey,
						})
						.signers([instructionAccount])
						.rpc();
				} catch (err) {
					error = err as AnchorError;
				}
				// assert
				assert.equal(error?.error.errorCode.number, 6007);
			});
		});

		describe('with mut modifier', () => {
			const instructionAccount = Keypair.generate();
			const instructionCloseAccount = Keypair.generate();

			before(async () => {
				const accountsData = {
					name: 'close',
					kind: 1,
					modifier: 1,
					space: null,
					uncheckedExplanation: null,
				};

				await program.methods
					.createInstructionAccount(accountsData)
					.accounts({
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						application: application.publicKey,
						instruction: instruction.publicKey,
						account: instructionCloseAccount.publicKey,
					})
					.signers([instructionCloseAccount])
					.rpc();
			});

			it('should create', async () => {
				// arrange
				const accountsData = {
					name: 'data',
					kind: 0,
					modifier: 1,
					space: null,
					uncheckedExplanation: null,
				};
				// act
				await program.methods
					.createInstructionAccount(accountsData)
					.accounts({
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						application: application.publicKey,
						instruction: instruction.publicKey,
						account: instructionAccount.publicKey,
					})
					.signers([instructionAccount])
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
						await program.methods
							.setInstructionAccountClose()
							.accounts({
								authority: provider.wallet.publicKey,
								workspace: workspace.publicKey,
								instruction: instruction.publicKey,
								close: instructionCloseAccount.publicKey,
								account: instructionAccount.publicKey,
							})
							.instruction(),
					])
					.rpc();
				// assert
				const account = await program.account.instructionAccount.fetch(
					instructionAccount.publicKey
				);
				const instructionAccountClosePublicKey =
					await PublicKey.createProgramAddress(
						[
							Buffer.from('instruction_account_close', 'utf8'),
							instructionAccount.publicKey.toBuffer(),
							Buffer.from([account.bumps.close]),
						],
						program.programId
					);
				const instructionAccountClose =
					await program.account.instructionAccountClose.fetch(
						instructionAccountClosePublicKey
					);
				const decodedKind = decodeAccountKind(account.kind as any);
				const decodedModifier = decodeAccountModifier(account.modifier as any);
				assert.ok(account.authority.equals(provider.wallet.publicKey));
				assert.ok(account.instruction.equals(instruction.publicKey));
				assert.ok(account.workspace.equals(workspace.publicKey));
				assert.ok(account.application.equals(application.publicKey));
				assert.equal(account.name, accountsData.name);
				assert.equal(decodedKind.id, accountsData.kind);
				assert.equal(decodedModifier.id, accountsData.modifier);
				assert.equal(decodedModifier.name, 'mut');
				assert.ok(
					instructionAccountClose.close?.equals(
						instructionCloseAccount.publicKey
					)
				);
			});

			it('should remove close when changing the modifier', async () => {
				// arrange
				const accountsData = {
					name: 'data',
					kind: 0,
					modifier: null,
					space: null,
					uncheckedExplanation: null,
				};
				// act
				await program.methods
					.updateInstructionAccount(accountsData)
					.accounts({
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						instruction: instruction.publicKey,
						account: instructionAccount.publicKey,
					})
					.rpc();
				// assert
				const account = await program.account.instructionAccount.fetch(
					instructionAccount.publicKey
				);
				const instructionAccountClosePublicKey =
					await PublicKey.createProgramAddress(
						[
							Buffer.from('instruction_account_close', 'utf8'),
							instructionAccount.publicKey.toBuffer(),
							Buffer.from([account.bumps.close]),
						],
						program.programId
					);
				const instructionAccountClose =
					await program.account.instructionAccountClose.fetch(
						instructionAccountClosePublicKey
					);
				assert.equal(account.modifier, null);
				assert.equal(account.space, null);
				assert.equal(instructionAccountClose.close, null);
			});

			it('should remove close when clearing', async () => {
				// arrange
				const accountsData = {
					name: 'data',
					kind: 0,
					modifier: 1,
					space: null,
					uncheckedExplanation: null,
				};
				// act
				await program.methods
					.updateInstructionAccount(accountsData)
					.accounts({
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						instruction: instruction.publicKey,
						account: instructionAccount.publicKey,
					})
					.postInstructions([
						await program.methods
							.setInstructionAccountClose()
							.accounts({
								authority: provider.wallet.publicKey,
								workspace: workspace.publicKey,
								instruction: instruction.publicKey,
								close: instructionCloseAccount.publicKey,
								account: instructionAccount.publicKey,
							})
							.instruction(),
					])
					.rpc();
				await program.methods
					.clearInstructionAccountClose()
					.accounts({
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						instruction: instruction.publicKey,
						account: instructionAccount.publicKey,
					})
					.rpc();
				// assert
				const account = await program.account.instructionAccount.fetch(
					instructionAccount.publicKey
				);
				const instructionAccountClosePublicKey =
					await PublicKey.createProgramAddress(
						[
							Buffer.from('instruction_account_close', 'utf8'),
							instructionAccount.publicKey.toBuffer(),
							Buffer.from([account.bumps.close]),
						],
						program.programId
					);
				const instructionAccountClose =
					await program.account.instructionAccountClose.fetch(
						instructionAccountClosePublicKey
					);
				assert.equal(instructionAccountClose.close, null);
			});
		});
	});

	describe('signer', () => {
		const instructionAccount = Keypair.generate();

		it('should create', async () => {
			// arrange
			const accountsData = {
				name: 'data',
				kind: 1,
				modifier: null,
				space: null,
				uncheckedExplanation: null,
			};
			// act
			await program.methods
				.createInstructionAccount(accountsData)
				.accounts({
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					account: instructionAccount.publicKey,
				})
				.signers([instructionAccount])
				.rpc();
			// assert
			const account = await program.account.instructionAccount.fetch(
				instructionAccount.publicKey
			);
			const decodedKind = decodeAccountKind(account.kind as any);
			assert.ok(account.authority.equals(provider.wallet.publicKey));
			assert.ok(account.instruction.equals(instruction.publicKey));
			assert.ok(account.workspace.equals(workspace.publicKey));
			assert.ok(account.application.equals(application.publicKey));
			assert.equal(account.name, accountsData.name);
			assert.equal(decodedKind.id, accountsData.kind);
			assert.equal(decodedKind.name, 'signer');
			assert.equal(account.modifier, null);
			assert.equal(account.space, null);
		});
	});

	describe('unchecked', () => {
		const instructionAccountKeypair = Keypair.generate();

		it('should create', async () => {
			// arrange
			const accountsData = {
				name: 'data',
				kind: 2,
				modifier: null,
				space: null,
				uncheckedExplanation: 'my explanation',
			};
			// act
			await program.methods
				.createInstructionAccount(accountsData)
				.accounts({
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					account: instructionAccountKeypair.publicKey,
				})
				.signers([instructionAccountKeypair])
				.rpc();
			// assert
			const instructionAccount = await program.account.instructionAccount.fetch(
				instructionAccountKeypair.publicKey
			);
			assert.ok(instructionAccount.authority.equals(provider.wallet.publicKey));
			assert.ok(instructionAccount.instruction.equals(instruction.publicKey));
			assert.ok(instructionAccount.workspace.equals(workspace.publicKey));
			assert.ok(instructionAccount.application.equals(application.publicKey));
			assert.equal(instructionAccount.name, accountsData.name);
			assert.ok('unchecked' in instructionAccount.kind);
			assert.equal(
				(instructionAccount.kind as any)['unchecked'].id,
				accountsData.kind
			);
			assert.equal(
				instructionAccount.uncheckedExplanation,
				accountsData.uncheckedExplanation
			);
			assert.ok(instructionAccount.createdAt.eq(instructionAccount.updatedAt));
		});
	});

	describe('mint', () => {
		const instructionAccountKeypair = Keypair.generate();

		it('should create', async () => {
			// arrange
			const accountsData = {
				name: 'data',
				kind: 3,
				modifier: null,
				space: null,
				uncheckedExplanation: null,
			};
			// act
			await program.methods
				.createInstructionAccount(accountsData)
				.accounts({
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					account: instructionAccountKeypair.publicKey,
				})
				.signers([instructionAccountKeypair])
				.rpc();
			// assert
			const instructionAccount = await program.account.instructionAccount.fetch(
				instructionAccountKeypair.publicKey
			);
			assert.ok(instructionAccount.authority.equals(provider.wallet.publicKey));
			assert.ok(instructionAccount.instruction.equals(instruction.publicKey));
			assert.ok(instructionAccount.workspace.equals(workspace.publicKey));
			assert.ok(instructionAccount.application.equals(application.publicKey));
			assert.equal(instructionAccount.name, accountsData.name);
			assert.ok('mint' in instructionAccount.kind);
			assert.equal(
				(instructionAccount.kind as any)['mint'].id,
				accountsData.kind
			);
			assert.ok(instructionAccount.createdAt.eq(instructionAccount.updatedAt));
		});
	});

	describe('token', () => {
		const instructionAccountKeypair = Keypair.generate();
		const mintInstructionAccountKeypair = Keypair.generate();
		const tokenAuthorityInstructionAccountKeypair = Keypair.generate();

		it('should create', async () => {
			// arrange
			const accountsData = {
				name: 'data',
				kind: 4,
				modifier: 0,
				space: null,
				uncheckedExplanation: null,
			};

			const anotherAccountData = {
				name: 'data',
				kind: 0,
				modifier: null,
				space: null,
				uncheckedExplanation: null,
			};

			// act
			await program.methods
				.createInstructionAccount(anotherAccountData)
				.accounts({
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					account: mintInstructionAccountKeypair.publicKey,
				})
				.postInstructions([
					await program.methods
						.createInstructionAccount(anotherAccountData)
						.accounts({
							authority: provider.wallet.publicKey,
							workspace: workspace.publicKey,
							application: application.publicKey,
							instruction: instruction.publicKey,
							account: tokenAuthorityInstructionAccountKeypair.publicKey,
						})
						.instruction(),
				])
				.signers([
					mintInstructionAccountKeypair,
					tokenAuthorityInstructionAccountKeypair,
				])
				.rpc();
			await program.methods
				.createInstructionAccount(accountsData)
				.accounts({
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					account: instructionAccountKeypair.publicKey,
				})
				.postInstructions([
					await program.methods
						.setTokenCofiguration()
						.accounts({
							authority: provider.wallet.publicKey,
							workspace: workspace.publicKey,
							application: application.publicKey,
							instruction: instruction.publicKey,
							account: instructionAccountKeypair.publicKey,
							mint: mintInstructionAccountKeypair.publicKey,
							tokenAuthority: tokenAuthorityInstructionAccountKeypair.publicKey,
						})
						.instruction(),
				])
				.signers([instructionAccountKeypair])
				.rpc();
			// assert
			const instructionAccount = await program.account.instructionAccount.fetch(
				instructionAccountKeypair.publicKey
			);
			assert.ok(instructionAccount.authority.equals(provider.wallet.publicKey));
			assert.ok(instructionAccount.instruction.equals(instruction.publicKey));
			assert.ok(instructionAccount.workspace.equals(workspace.publicKey));
			assert.ok(instructionAccount.application.equals(application.publicKey));
			assert.equal(instructionAccount.name, accountsData.name);
			assert.ok('token' in instructionAccount.kind);
			assert.equal(
				(instructionAccount.kind as any)['token'].id,
				accountsData.kind
			);
			assert.isTrue(
				instructionAccount.mint?.equals(mintInstructionAccountKeypair.publicKey)
			);
			assert.isTrue(
				instructionAccount.tokenAuthority?.equals(
					tokenAuthorityInstructionAccountKeypair.publicKey
				)
			);
			assert.ok(instructionAccount.createdAt.eq(instructionAccount.updatedAt));
		});
	});

	describe('unhappy paths', () => {
		let instruction = Keypair.generate();

		before(async () => {
			[instructionStatsPublicKey] = await PublicKey.findProgramAddress(
				[
					Buffer.from('instruction_stats', 'utf8'),
					instruction.publicKey.toBuffer(),
				],
				program.programId
			);

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
		});

		it('should fail when deleting account with relations', async () => {
			// arrange
			const instructionAccount1 = Keypair.generate();
			const instructionAccount2 = Keypair.generate();
			const accountsData = {
				name: '12345678901234567890123456789012',
				kind: 0,
				modifier: null,
				space: null,
				uncheckedExplanation: null,
			};
			let error: AnchorError | null = null;
			// act
			try {
				await program.methods
					.createInstructionAccount(accountsData)
					.accounts({
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						application: application.publicKey,
						instruction: instruction.publicKey,
						account: instructionAccount1.publicKey,
					})
					.signers([instructionAccount1])
					.remainingAccounts([
						{
							pubkey: collection.publicKey,
							isWritable: false,
							isSigner: false,
						},
					])
					.rpc();
				await program.methods
					.createInstructionAccount(accountsData)
					.accounts({
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						application: application.publicKey,
						instruction: instruction.publicKey,
						account: instructionAccount2.publicKey,
					})
					.signers([instructionAccount2])
					.rpc();
				await program.methods
					.createInstructionRelation()
					.accounts({
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						application: application.publicKey,
						instruction: instruction.publicKey,
						from: instructionAccount1.publicKey,
						to: instructionAccount2.publicKey,
					})
					.rpc();
				await program.methods
					.deleteInstructionAccount()
					.accounts({
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						instruction: instruction.publicKey,
						account: instructionAccount1.publicKey,
					})
					.rpc();
			} catch (err) {
				error = err as AnchorError;
			}
			// assert
			assert.equal(error?.error.errorCode.number, 6015);
		});

		it('should increment instruction account quantity on create', async () => {
			// arrange
			const instructionAccount = Keypair.generate();
			const instruction = Keypair.generate();
			const accountsData = {
				name: 'data',
				kind: 0,
				modifier: null,
				space: null,
				uncheckedExplanation: null,
			};
			[instructionStatsPublicKey] = await PublicKey.findProgramAddress(
				[
					Buffer.from('instruction_stats', 'utf8'),
					instruction.publicKey.toBuffer(),
				],
				program.programId
			);
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
			await program.methods
				.createInstructionAccount(accountsData)
				.accounts({
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					account: instructionAccount.publicKey,
				})
				.signers([instructionAccount])
				.remainingAccounts([
					{
						pubkey: collection.publicKey,
						isWritable: false,
						isSigner: false,
					},
				])
				.rpc();
			// assert
			const instructionStatsAccount =
				await program.account.instructionStats.fetch(instructionStatsPublicKey);
			assert.equal(instructionStatsAccount.quantityOfAccounts, 1);
		});

		it('should decrement instruction account quantity on delete', async () => {
			// arrange
			const instructionAccount = Keypair.generate();
			const instruction = Keypair.generate();
			const accountsData = {
				name: 'data',
				kind: 0,
				modifier: null,
				space: null,
				uncheckedExplanation: null,
			};
			[instructionStatsPublicKey] = await PublicKey.findProgramAddress(
				[
					Buffer.from('instruction_stats', 'utf8'),
					instruction.publicKey.toBuffer(),
				],
				program.programId
			);
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
			await program.methods
				.createInstructionAccount(accountsData)
				.accounts({
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					application: application.publicKey,
					instruction: instruction.publicKey,
					account: instructionAccount.publicKey,
				})
				.signers([instructionAccount])
				.rpc();
			await program.methods
				.deleteInstructionAccount()
				.accounts({
					authority: provider.wallet.publicKey,
					workspace: workspace.publicKey,
					instruction: instruction.publicKey,
					account: instructionAccount.publicKey,
				})
				.rpc();
			// assert
			const instructionStatsAccount =
				await program.account.instructionStats.fetch(instructionStatsPublicKey);
			assert.equal(instructionStatsAccount.quantityOfAccounts, 0);
		});

		it('should fail when providing wrong "instruction" to delete', async () => {
			// arrange
			const newInstruction = Keypair.generate();
			const newInstructionName = 'sample';
			const newAccount = Keypair.generate();
			const accountsData = {
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
					.createInstruction({ name: newInstructionName })
					.accounts({
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						application: application.publicKey,
						instruction: newInstruction.publicKey,
					})
					.signers([newInstruction])
					.rpc();
				await program.methods
					.createInstructionAccount(accountsData)
					.accounts({
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						application: application.publicKey,
						instruction: newInstruction.publicKey,
						account: newAccount.publicKey,
					})
					.signers([newAccount])
					.rpc();
				await program.methods
					.deleteInstructionAccount()
					.accounts({
						authority: provider.wallet.publicKey,
						workspace: workspace.publicKey,
						instruction: instruction.publicKey,
						account: newAccount.publicKey,
					})
					.rpc();
			} catch (err) {
				error = err as AnchorError;
			}
			// assert
			assert.equal(error?.error.errorCode.number, 6044);
		});

		it('should fail when workspace has insufficient funds', async () => {
			// arrange
			const newWorkspace = Keypair.generate();
			const newWorkspaceName = 'sample';
			const newApplication = Keypair.generate();
			const newApplicationName = 'sample';
			const newInstruction = Keypair.generate();
			const newInstructionName = 'sample';
			const newAccount = Keypair.generate();
			const accountsData = {
				name: 'data',
				kind: 0,
				modifier: null,
				space: null,
				uncheckedExplanation: null,
			};
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
								2173 // instruction account size
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
			try {
				await program.methods
					.createInstructionAccount(accountsData)
					.accounts({
						authority: provider.wallet.publicKey,
						workspace: newWorkspace.publicKey,
						application: newApplication.publicKey,
						instruction: newInstruction.publicKey,
						account: newAccount.publicKey,
					})
					.signers([newAccount])
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
			const newAccount = Keypair.generate();
			const accountsData = {
				name: 'data',
				kind: 0,
				modifier: null,
				space: null,
				uncheckedExplanation: null,
			};
			let error: AnchorError | null = null;
			// act
			try {
				await program.methods
					.createInstructionAccount(accountsData)
					.accounts({
						authority: newUser.publicKey,
						workspace: workspace.publicKey,
						application: application.publicKey,
						instruction: instruction.publicKey,
						account: newAccount.publicKey,
					})
					.signers([newUser, newAccount])
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
			const newAccount = Keypair.generate();
			const accountsData = {
				name: 'data',
				kind: 0,
				modifier: null,
				space: null,
				uncheckedExplanation: null,
			};
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
					.createInstructionAccount(accountsData)
					.accounts({
						authority: newUser.publicKey,
						workspace: workspace.publicKey,
						application: application.publicKey,
						instruction: instruction.publicKey,
						account: newAccount.publicKey,
					})
					.signers([newUser, newAccount])
					.rpc();
			} catch (err) {
				error = err as AnchorError;
			}
			// assert
			assert.equal(error?.error.errorCode.number, 6029);
		});
	});
});
