import { BN } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';
import { ApplicationFunction, Probot } from 'probot';
import { getBoard, getBounty, getBountyVault } from './state';
import {
	getBountyClosedCommentBody,
	getBountyEnabledCommentBody,
	getBountyHunterChangedCommentBody,
	getErrorCommentBody,
	getErrorMessage,
	getExplorerUrl,
	getProgram,
	getProvider,
	getSolanaConfig,
	getSolanaPayQR,
} from './utils';

export const createDrillGithubApp =
	(programId: PublicKey, cluster: string): ApplicationFunction =>
	(app: Probot) => {
		// Handle bounty initialization
		app.on('issues.labeled', async (context) => {
			if (context.payload.label?.name !== 'drill:bounty') {
				return;
			}
			const {
				payload: { issue, repository },
			} = context;
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(programId, provider);
			const [boardPublicKey] = await PublicKey.findProgramAddress(
				[
					Buffer.from('board', 'utf8'),
					new BN(repository.id).toArrayLike(Buffer, 'le', 4),
				],
				program.programId
			);
			const [bountyPublicKey] = await PublicKey.findProgramAddress(
				[
					Buffer.from('bounty', 'utf8'),
					boardPublicKey.toBuffer(),
					new BN(issue.number).toArrayLike(Buffer, 'le', 4),
				],
				program.programId
			);
			const [bountyVaultPublicKey] = await PublicKey.findProgramAddress(
				[Buffer.from('bounty_vault', 'utf8'), bountyPublicKey.toBuffer()],
				program.programId
			);

			const bountyAccount = await program.account.bounty.fetchNullable(
				bountyPublicKey
			);
			if (issue.labels !== undefined) {
				await Promise.all(
					issue.labels
						.filter((label) => label.name.includes('drill:bounty'))
						.map(({ name }) =>
							context.octokit.issues.removeLabel(
								context.issue({
									name,
								})
							)
						)
				);
			}
			let bountyAlreadyExist = false;
			// When bounty exists just sync the labels in GH
			if (bountyAccount !== null) {
				await context.octokit.issues.addLabels(
					context.issue({
						labels: bountyAccount.isClosed
							? ['drill:bounty:closed']
							: ['drill:bounty:enabled'],
					})
				);

				bountyAlreadyExist = true;
			}

			const board = await program.account.board.fetch(boardPublicKey);
			const imagePath = `.drill/${issue.number}.jpg`;

			if (!bountyAlreadyExist) {
				await context.octokit.issues.addLabels(
					context.issue({
						labels: ['drill:bounty:processing'],
					})
				);

				try {
					await program.methods
						.initializeBounty(repository.id, issue.number)
						.accounts({
							acceptedMint: board.acceptedMint,
							authority: provider.wallet.publicKey,
						})
						.simulate();
					console.log('5');
					await program.methods
						.initializeBounty(repository.id, issue.number)
						.accounts({
							acceptedMint: board.acceptedMint,
							authority: provider.wallet.publicKey,
						})
						.rpc();

					// solana pay
					const QR = await getSolanaPayQR(
						bountyVaultPublicKey.toBase58(),
						board.acceptedMint.toBase58()
					);

					await context.octokit.repos.createOrUpdateFileContents(
						context.repo({
							path: imagePath,
							message: 'feat: Added solana QR image',
							content: QR.base64,
							committer: {
								name: 'Drill Bot',
								email: 'danielarturomt@gmail.com',
							},
							author: {
								name: 'Drill Bot',
								email: 'danielarturomt@gmail.com',
							},
						})
					);
				} catch (error) {
					Promise.all([
						context.octokit.issues.removeLabel(
							context.issue({
								name: 'drill:bounty:processing',
							})
						),
						context.octokit.issues.addLabels(
							context.issue({
								labels: ['drill:bounty:failed'],
							})
						),
						context.octokit.issues.createComment(
							context.issue({
								body: getErrorCommentBody(
									'# ⚠️ Bounty Failed',
									(error as any).simulationResponse === null
										? getErrorMessage(error)
										: (error as any).simulationResponse.logs?.join('\n') ?? ''
								),
								contentType: 'text/x-markdown',
							})
						),
					]);
					return {
						message: 'Something when wrong while simulating initializeBounty',
						error: getErrorMessage(error),
					};
				}
			}

			try {
				const boardAccount = await getBoard(program, repository.id);
				const bountyAccount = await getBounty(
					program,
					repository.id,
					issue.number
				);
				let bountyVault;

				try {
					bountyVault = await getBountyVault(
						program,
						boardAccount.id,
						bountyAccount.id
					);
				} catch (e) {
					const solanaErrorMessage =
						'A Solana error ocurred. Sometimes the network could be offline or slow to respond. try removing the "drill:bounty:failed" and to add the "drill:bounty" tag again';
					Promise.all([
						context.octokit.issues.removeLabel(
							context.issue({
								name: 'drill:bounty:processing',
							})
						),
						context.octokit.issues.addLabels(
							context.issue({
								labels: ['drill:bounty:failed'],
							})
						),
						context.octokit.issues.createComment(
							context.issue({
								body: getErrorCommentBody(
									'# ⚠️ Bounty Failed',
									solanaErrorMessage
								),

								contentType: 'text/x-markdown',
							})
						),
					]);
					return {
						message: 'Something when wrong while initializing bounty',
						error: solanaErrorMessage,
					};
				}
				const boardMessageData = {
					id: bountyAccount.boardId,
					publicKey: boardPublicKey.toBase58(),
					lockTime: boardAccount.lockTime,
					authority: boardAccount.authority.toBase58(),
				};

				const bountyMessageData = {
					id: bountyAccount.id,
					publicKey: bountyPublicKey.toBase58(),
					vaultATA: bountyVault.address.toBase58(),
					vaultAmount: bountyVault.amount,
				};

				return Promise.all([
					context.octokit.issues.removeLabel(
						context.issue({
							name: 'drill:bounty:processing',
						})
					),
					context.octokit.issues.addLabels(
						context.issue({
							labels: ['drill:bounty:enabled'],
						})
					),
					context.octokit.issues.createComment(
						context.issue({
							body: getBountyEnabledCommentBody(
								boardMessageData,
								bountyMessageData,
								`${repository.owner.login}/${repository.name}`,
								getExplorerUrl(
									'address',
									boardMessageData.publicKey,
									cluster,
									provider.connection.rpcEndpoint
								),
								getExplorerUrl(
									'address',
									boardMessageData.authority,
									cluster,
									provider.connection.rpcEndpoint
								),
								getExplorerUrl(
									'address',
									bountyMessageData.publicKey,
									cluster,
									provider.connection.rpcEndpoint
								),
								getExplorerUrl(
									'address',
									bountyMessageData.vaultATA,
									cluster,
									provider.connection.rpcEndpoint
								),
								imagePath
							),
							contentType: 'text/x-markdown',
						})
					),
				]);
			} catch (error) {
				Promise.all([
					context.octokit.issues.removeLabel(
						context.issue({
							name: 'drill:bounty:processing',
						})
					),
					context.octokit.issues.addLabels(
						context.issue({
							labels: ['drill:bounty:failed'],
						})
					),
					context.octokit.issues.createComment(
						context.issue({
							body: getErrorCommentBody(
								'# ⚠️ Bounty Failed',
								getErrorMessage(error)
							),

							contentType: 'text/x-markdown',
						})
					),
				]);
				return {
					message: 'Something when wrong while initializing bounty',
					error: getErrorMessage(error),
				};
			}
		});

		// Handle manual close of bounty
		app.on('issues.labeled', async (context) => {
			if (context.payload.label?.name !== 'drill:bounty:manual-close') {
				return;
			}

			const {
				payload: { repository, issue },
			} = context;
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(programId, provider);
			const [boardPublicKey] = await PublicKey.findProgramAddress(
				[
					Buffer.from('board', 'utf8'),
					new BN(repository.id).toArrayLike(Buffer, 'le', 4),
				],
				program.programId
			);
			const [bountyPublicKey] = await PublicKey.findProgramAddress(
				[
					Buffer.from('bounty', 'utf8'),
					boardPublicKey.toBuffer(),
					new BN(issue.number).toArrayLike(Buffer, 'le', 4),
				],
				program.programId
			);

			const bountyAccount = await program.account.bounty.fetchNullable(
				bountyPublicKey
			);

			if (issue.labels !== undefined) {
				await Promise.all(
					issue.labels
						.filter((label) => label.name.includes('drill:bounty'))
						.map(({ name }) =>
							context.octokit.issues.removeLabel(
								context.issue({
									name,
								})
							)
						)
				);
			}

			if (bountyAccount === null) {
				return Promise.all([
					context.octokit.issues.addLabels(
						context.issue({
							labels: ['drill:bounty:close-failed'],
						})
					),
					context.octokit.issues.createComment(
						context.issue({
							body: getErrorCommentBody(
								'# ⚠️ Failed to close bounty',
								'Bounty is not initialized'
							),
							contentType: 'text/x-markdown',
						})
					),
				]);
			}

			if (bountyAccount.isClosed) {
				return context.octokit.issues.addLabels(
					context.issue({
						labels: ['drill:bounty:closed'],
					})
				);
			}

			await context.octokit.issues.addLabels(
				context.issue({
					labels: ['drill:bounty:closing'],
				})
			);

			try {
				await program.methods
					.closeBounty(
						repository.id,
						issue.number,
						issue.assignee?.login ?? null
					)
					.accounts({
						authority: provider.wallet.publicKey,
					})
					.simulate();
			} catch (error) {
				return Promise.all([
					context.octokit.issues.removeLabel(
						context.issue({
							name: 'drill:bounty:closing',
						})
					),
					context.octokit.issues.addLabels(
						context.issue({
							labels: ['drill:bounty:close-failed'],
						})
					),
					context.octokit.issues.createComment(
						context.issue({
							body: getErrorCommentBody(
								'# ⚠️ Failed to close bounty',
								(error as any).simulationResponse === null
									? getErrorMessage(error)
									: (error as any).simulationResponse.logs?.join('\n') ?? ''
							),
							contentType: 'text/x-markdown',
						})
					),
				]);
			}

			try {
				const signature = await program.methods
					.closeBounty(
						repository.id,
						issue.number,
						issue.assignee?.login ?? null
					)
					.accounts({
						authority: provider.wallet.publicKey,
					})
					.rpc();

				return Promise.all([
					context.octokit.issues.removeLabel(
						context.issue({
							name: 'drill:bounty:closing',
						})
					),
					context.octokit.issues.addLabels(
						context.issue({
							labels: ['drill:bounty:closed'],
						})
					),
					context.octokit.issues.createComment(
						context.issue({
							body: getBountyClosedCommentBody(
								getExplorerUrl(
									'tx',
									signature,
									cluster,
									provider.connection.rpcEndpoint
								),
								issue.assignee?.login
							),
							contentType: 'text/x-markdown',
						})
					),
				]);
			} catch (error) {
				return Promise.all([
					context.octokit.issues.removeLabel(
						context.issue({
							name: 'drill:bounty:closing',
						})
					),
					context.octokit.issues.addLabels(
						context.issue({
							labels: ['drill:bounty:close-failed'],
						})
					),
					context.octokit.issues.createComment(
						context.issue({
							body: getErrorCommentBody(
								'# ⚠️ Failed to close bounty',
								getErrorMessage(error)
							),
							contentType: 'text/x-markdown',
						})
					),
				]);
			}
		});

		// Handle issue closed
		app.on('issues.closed', async (context) => {
			const {
				payload: { issue, repository },
			} = context;
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(programId, provider);
			const [boardPublicKey] = await PublicKey.findProgramAddress(
				[
					Buffer.from('board', 'utf8'),
					new BN(repository.id).toArrayLike(Buffer, 'le', 4),
				],
				program.programId
			);
			const [bountyPublicKey] = await PublicKey.findProgramAddress(
				[
					Buffer.from('bounty', 'utf8'),
					boardPublicKey.toBuffer(),
					new BN(issue.number).toArrayLike(Buffer, 'le', 4),
				],
				program.programId
			);
			const bountyAccount = await program.account.bounty.fetchNullable(
				bountyPublicKey
			);

			if (issue.labels !== undefined) {
				await Promise.all(
					issue.labels
						.filter((label) => label.name.includes('drill:bounty'))
						.map(({ name }) =>
							context.octokit.issues.removeLabel(
								context.issue({
									name,
								})
							)
						)
				);
			}

			if (bountyAccount === null) {
				return Promise.all([
					context.octokit.issues.addLabels(
						context.issue({
							labels: ['drill:bounty:close-failed'],
						})
					),
					context.octokit.issues.createComment(
						context.issue({
							body: getErrorCommentBody(
								'# ⚠️ Failed to close bounty',
								'Bounty is not initialized'
							),
							contentType: 'text/x-markdown',
						})
					),
				]);
			}

			if (bountyAccount.isClosed) {
				return context.octokit.issues.addLabels(
					context.issue({
						labels: ['drill:bounty:closed'],
					})
				);
			}

			await context.octokit.issues.addLabels(
				context.issue({
					labels: ['drill:bounty:closing'],
				})
			);

			try {
				await program.methods
					.closeBounty(
						repository.id,
						issue.number,
						issue.assignee?.login ?? null
					)
					.accounts({
						authority: provider.wallet.publicKey,
					})
					.simulate();
			} catch (error) {
				return Promise.all([
					context.octokit.issues.removeLabel(
						context.issue({
							name: 'drill:bounty:closing',
						})
					),
					context.octokit.issues.addLabels(
						context.issue({
							labels: ['drill:bounty:close-failed'],
						})
					),
					context.octokit.issues.createComment(
						context.issue({
							body: getErrorCommentBody(
								'# ⚠️ Failed to close bounty',
								(error as any).simulationResponse === null
									? getErrorMessage(error)
									: (error as any).simulationResponse.logs?.join('\n') ?? ''
							),
							contentType: 'text/x-markdown',
						})
					),
				]);
			}

			try {
				const signature = await program.methods
					.closeBounty(
						repository.id,
						issue.number,
						issue.assignee?.login ?? null
					)
					.accounts({
						authority: provider.wallet.publicKey,
					})
					.rpc();

				return Promise.all([
					context.octokit.issues.removeLabel(
						context.issue({
							name: 'drill:bounty:closing',
						})
					),
					context.octokit.issues.addLabels(
						context.issue({
							labels: ['drill:bounty:closed'],
						})
					),
					context.octokit.issues.createComment(
						context.issue({
							body: getBountyClosedCommentBody(
								getExplorerUrl(
									'tx',
									signature,
									cluster,
									provider.connection.rpcEndpoint
								),
								issue.assignee?.login
							),
							contentType: 'text/x-markdown',
						})
					),
				]);
			} catch (error) {
				return await Promise.all([
					context.octokit.issues.removeLabel(
						context.issue({
							name: 'drill:bounty:closing',
						})
					),
					context.octokit.issues.addLabels(
						context.issue({
							labels: ['drill:bounty:close-failed'],
						})
					),
					context.octokit.issues.createComment(
						context.issue({
							body: getErrorCommentBody(
								'# ⚠️ Failed to close bounty',
								getErrorMessage(error)
							),
							contentType: 'text/x-markdown',
						})
					),
				]);
			}
		});

		// Handle issue assigned
		app.on('issues.assigned', async (context) => {
			const {
				payload: { issue, repository, assignee },
			} = context;
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(programId, provider);
			const [boardPublicKey] = await PublicKey.findProgramAddress(
				[
					Buffer.from('board', 'utf8'),
					new BN(repository.id).toArrayLike(Buffer, 'le', 4),
				],
				program.programId
			);
			const [bountyPublicKey] = await PublicKey.findProgramAddress(
				[
					Buffer.from('bounty', 'utf8'),
					boardPublicKey.toBuffer(),
					new BN(issue.number).toArrayLike(Buffer, 'le', 4),
				],
				program.programId
			);
			const bountyAccount = await program.account.bounty.fetchNullable(
				bountyPublicKey
			);

			if (
				assignee === undefined ||
				assignee === null ||
				bountyAccount === null ||
				!bountyAccount.isClosed
			) {
				return;
			}

			await context.octokit.issues.addLabels(
				context.issue({
					labels: ['drill:bounty:changing-bounty-hunter'],
				})
			);

			try {
				await program.methods
					.setBountyHunter(repository.id, issue.number, assignee.login)
					.accounts({
						authority: provider.wallet.publicKey,
					})
					.simulate();
			} catch (error) {
				return Promise.all([
					context.octokit.issues.removeLabel(
						context.issue({
							name: 'drill:bounty:changing-bounty-hunter',
						})
					),
					context.octokit.issues.addLabels(
						context.issue({
							labels: ['drill:bounty:change-bounty-hunter-failed'],
						})
					),
					context.octokit.issues.createComment(
						context.issue({
							body: getErrorCommentBody(
								'# ⚠️ Failed to change bounty hunter',
								(error as any).simulationResponse === null
									? getErrorMessage(error)
									: (error as any).simulationResponse.logs?.join('\n') ?? ''
							),
							contentType: 'text/x-markdown',
						})
					),
				]);
			}

			try {
				const signature = await program.methods
					.setBountyHunter(repository.id, issue.number, assignee.login)
					.accounts({
						authority: provider.wallet.publicKey,
					})
					.rpc();

				return Promise.all([
					context.octokit.issues.removeLabel(
						context.issue({
							name: 'drill:bounty:changing-bounty-hunter',
						})
					),
					context.octokit.issues.createComment(
						context.issue({
							body: getBountyHunterChangedCommentBody(
								getExplorerUrl(
									'tx',
									signature,
									cluster,
									provider.connection.rpcEndpoint
								),
								assignee.login
							),
							contentType: 'text/x-markdown',
						})
					),
				]);
			} catch (error) {
				return await Promise.all([
					context.octokit.issues.removeLabel(
						context.issue({
							name: 'drill:bounty:changing-bounty-hunter',
						})
					),
					context.octokit.issues.addLabels(
						context.issue({
							labels: ['drill:bounty:change-bounty-hunter-failed'],
						})
					),
					context.octokit.issues.createComment(
						context.issue({
							body: getErrorCommentBody(
								'# ⚠️ Failed to change bounty hunter',
								getErrorMessage(error)
							),
							contentType: 'text/x-markdown',
						})
					),
				]);
			}
		});
	};
