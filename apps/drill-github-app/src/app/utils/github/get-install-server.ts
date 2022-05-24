import { join } from 'path';
import { Options, Probot, Server } from 'probot';
import { ServerOptions } from 'probot/lib/types';
import { setupAppFactory } from './github-install';

export const getInstallServer = async () => {
	const probotOptions: Options = {};
	const serverOptions: ServerOptions = {
		Probot: Probot,
	};
	const server = new Server({
		...serverOptions,
		Probot: Probot.defaults({
			...probotOptions,
			appId: 1,
			privateKey: 'dummy value for setup, see #1512',
		}),
	});

	server.expressApp.set(
		'views',
		join(__dirname, '..', '..', '..', 'apps/drill-github-app/src/views')
	);
	console.log('EPALE', serverOptions, probotOptions);
	await server.load(setupAppFactory(undefined, undefined));
	await server.start();

	return server;
};
