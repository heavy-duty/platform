import { PublicKey } from '@solana/web3.js';
import { config } from 'dotenv';
import { createProbot } from 'probot';
import { createNodeMiddleware } from 'probot/lib/create-node-middleware';
import { createDrillGithubApp } from './app';
import { getInstallServer } from './app/utils/github/get-install-server';

const main = async () => {
	config();

	if (
		process.env.APP_ID === undefined ||
		process.env.GITHUB_CLIENT_SECRET === undefined
	) {
		await getInstallServer();
		return;
	}

	if (process.env.PROGRAM_ID === undefined) {
		throw new Error('PROGRAM_ID env variable is missing.');
	}

	return createNodeMiddleware(
		createDrillGithubApp(
			new PublicKey(process.env.PROGRAM_ID),
			process.env.CLUSTER ?? 'custom'
		),
		{
			probot: createProbot({
				defaults: {
					appId: process.env.APP_ID,
					privateKey: process.env.PRIVATE_KEY,
					secret: process.env.WEBHOOK_SECRET,
				},
			}),
		}
	);
};

export default main();
