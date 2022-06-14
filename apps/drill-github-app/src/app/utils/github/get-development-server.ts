import { PublicKey } from '@solana/web3.js';
import { Probot, Server } from 'probot';
import { createDrillGithubApp } from '../..';

export const getDevelopmentServer = async () => {
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
			process.env.CLUSTER ?? 'custom'
		)
	);

	server.start();
};
