import { PublicKey } from '@solana/web3.js';
import { config } from 'dotenv';
import { Probot, Server } from 'probot';
import { createDrillGithubApp } from './app';

const main = async () => {
	config();

	if (process.env.ACCEPTED_MINT === undefined) {
		throw new Error('ACCEPTED_MINT env variable is missing.');
	}

	if (process.env.PROGRAM_ID === undefined) {
		throw new Error('PROGRAM_ID env variable is missing.');
	}

	const server = new Server({
		webhookProxy: process.env.WEBHOOK_PROXY_URL,
		Probot: Probot.defaults({
			appId: process.env.APP_ID,
			privateKey: process.env.PRIVATE_KEY,
			secret: process.env.WEBHOOK_SECRET,
		}),
	});

	await server.load(
		createDrillGithubApp(
			new PublicKey(process.env.PROGRAM_ID),
			new PublicKey(process.env.ACCEPTED_MINT),
			process.env.CLUSTER ?? 'custom'
		)
	);

	server.start();
};

main();
