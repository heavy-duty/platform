import { exec } from 'child_process';
import { Request, Response } from 'express';
import { ApplicationFunctionOptions, Probot } from 'probot';
import { ManifestCreation } from './manifest-creation';

export const setupAppFactory = (
	host: string | undefined,
	port: number | undefined
) =>
	async function setupApp(
		app: Probot,
		{ getRouter }: ApplicationFunctionOptions
	) {
		const setup: ManifestCreation = new ManifestCreation();

		if (!getRouter) {
			throw new Error('getRouter is required to use the setup app');
		}

		await setup.createWebhookChannel();

		const route = getRouter();

		printWelcomeMessage(app, host, port);
		route.get('/probot', async (req, res) => {
			const baseUrl = getBaseUrl(req);
			const pkg = setup.pkg;
			const manifest = setup.getManifest(pkg, baseUrl);
			const createAppUrl = setup.createAppUrl;
			console.log('MANIFEST', setup.getManifest(pkg, baseUrl));
			// Pass the manifest to be POST'd
			res.render('setup.handlebars', { pkg, createAppUrl, manifest });
		});

		route.get('/probot/setup', async (req: Request, res: Response) => {
			const { code } = req.query;
			const response = await setup.createAppFromCode(code);

			// If using glitch, restart the app
			if (process.env.PROJECT_DOMAIN) {
				exec('refresh', (error) => {
					if (error) {
						app.log.error(error);
					}
				});
			} else {
				printRestartMessage(app);
			}

			res.redirect(`${response}/installations/new`);
		});

		route.get('/probot/success', async (req, res) => {
			res.render('success.handlebars');
		});

		route.get('/', (req, res, next) => res.redirect('/probot'));
	};

function printWelcomeMessage(
	app: Probot,
	host: string | undefined,
	port: number | undefined
) {
	// use glitch env to get correct domain welcome message
	// https://glitch.com/help/project/
	const domain =
		process.env.PROJECT_DOMAIN ||
		`http://${host ?? 'localhost'}:${port || 3000}`;

	[
		``,
		`Welcome to HeavyDuty Github App install!`,
		`We use probot under the hood, and before you start you need `,
		`to configure the APP_ID and PRIVATE_KEY, and then update`,
		`the .env file to match the correct values.`,
		`Please follow the instructions at ${domain} to configure .env.`,
		`Once you are done, restart the server.`,
		``,
	].forEach((line) => {
		app.log.info(line);
	});
}

function printRestartMessage(app: Probot) {
	app.log.info('');
	app.log.info(
		'Drill Github app has been set up successfully, please restart the server!'
	);
	app.log.info('');
}

function getBaseUrl(req: Request): string {
	const protocols = req.headers['x-forwarded-proto'] || req.protocol;
	const protocol =
		typeof protocols === 'string' ? protocols.split(',')[0] : protocols[0];
	const host = req.headers['x-forwarded-host'] || req.get('host');
	const baseUrl = `${protocol}://${host}`;
	return baseUrl;
}
