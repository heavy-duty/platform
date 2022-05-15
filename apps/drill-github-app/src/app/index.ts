import { BN } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';
import { Probot } from 'probot';
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
} from './utils';

export const createDrillGithubApp =
	(programId: PublicKey, acceptedMint: PublicKey, cluster: string) =>
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

			// When bounty exists just sync the labels in GH
			if (bountyAccount !== null) {
				return context.octokit.issues.addLabels(
					context.issue({
						labels: bountyAccount.isClosed
							? ['drill:bounty:closed']
							: ['drill:bounty:enabled'],
					})
				);
			}

			await context.octokit.issues.addLabels(
				context.issue({
					labels: ['drill:bounty:processing'],
				})
			);

			try {
				await program.methods
					.initializeBounty(repository.id, issue.number)
					.accounts({
						acceptedMint,
						authority: provider.wallet.publicKey,
					})
					.simulate();
			} catch (error) {
				return Promise.all([
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
			}

			try {
				const signature = await program.methods
					.initializeBounty(repository.id, issue.number)
					.accounts({
						acceptedMint,
						authority: provider.wallet.publicKey,
					})
					.rpc();

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
								getExplorerUrl(
									signature,
									cluster,
									provider.connection.rpcEndpoint
								)
							),
							contentType: 'text/x-markdown',
						})
					),
				]);
			} catch (error) {
				return Promise.all([
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
