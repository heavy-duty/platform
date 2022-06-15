import { execSync } from 'child_process';
import { formatName } from '../generators/utils';
import { Workspace } from '../state';
import { log } from './log';

export enum CommandResponse {
	success = 0,
	error = -1,
}

export const anchorDeploy = (
	workspace: Workspace,
	outDir: string
): CommandResponse => {
	const pathToWorkspace = `${outDir}/${formatName(workspace.name).snakeCase}`;
	log(pathToWorkspace);

	try {
		log('⏳ Installing NPM...');

		const resp = execSync(`cd ${pathToWorkspace} && npm i`, {
			encoding: 'utf8',
		});
		log(resp);
		log('Success..');
		log('----');
		log('');
	} catch (e) {
		log('Something go wrong using npm:');
		log(e);
		return CommandResponse.error;
	}

	try {
		log('⏳ Building Anchor...');
		const resp = execSync(`cd ${pathToWorkspace} && anchor build`, {
			encoding: 'utf8',
		});
		log(resp);
		log('Success..');
		log('----');
		log('');
	} catch (e) {
		log('Something go wrong building with anchor:');
		log(e);
		return CommandResponse.error;
	}

	try {
		log('⏳ Deploying Anchor...');
		const resp = execSync(
			`cd ${pathToWorkspace} && anchor deploy --provider.cluster devnet`,
			{
				encoding: 'utf8',
			}
		);
		log(resp);
		log('Success..');
		log('----');
		log('');
	} catch (e) {
		log('Something go wrong building with anchor:');
		log(e);
		return CommandResponse.error;
	}

	return CommandResponse.success;
};

export const anchorBuild = (
	workspace: Workspace,
	outDir: string
): CommandResponse => {
	const pathToWorkspace = `${outDir}/${formatName(workspace.name).snakeCase}`;

	try {
		log('⏳ Installing NPM...');
		log('');
		const resp = execSync(`cd ${pathToWorkspace} && npm i`, {
			encoding: 'utf8',
		});
		log(resp);
		log('Success..');
		log('----');
		log('');
	} catch (e) {
		log('Something go wrong using npm:');
		log(e);
		return CommandResponse.error;
	}

	try {
		log('⏳ Building Anchor...');
		const resp = execSync(`cd ${pathToWorkspace} && anchor build`, {
			encoding: 'utf8',
		});
		log(resp);
		log('Success..');
		log('----');
		log('');
	} catch (e) {
		log('Something go wrong building with anchor:');
		log(e);
		return CommandResponse.error;
	}

	return CommandResponse.success;
};
