import { PublicKey } from '@solana/web3.js';
import { config } from 'dotenv';
import { createNodeMiddleware, createProbot } from 'probot';
import { createDrillGithubApp } from './app';

config();

if (process.env.PROGRAM_ID === undefined) {
	throw new Error('PROGRAM_ID env variable is missing.');
}

export default createNodeMiddleware(
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
