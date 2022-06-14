import { Command, CommandRunner } from 'nest-commander';
import { log } from '../utils';
import { anchorDeploy } from '../utils/anchor-deploy';

@Command({
	name: 'deploy-app',
	description:
		'Generate the source code for a specific App in a Workspace, build and deploy them using Anchor Build command under the hood. You need to pass two arguments, one to specify the workspace id in which you have the app you want to deploy. The other argument is the app id, to select it',
	arguments: '<workspace-id> <application-id>',
	argsDescription: {
		'workspace-id': '(public key) The workspace id which you want to select',
		'application-id': '(public key) The App id which you want to select ',
	},
})
export class DeployAppCommand implements CommandRunner {
	async run(params: string[]) {
		try {
			log(`Deploying >> Workspace ID: ${params[0]} - App Id: ${params[1]}`);

			const resp = await anchorDeploy();

			log(resp);
			log('lo que pasa 4');
		} catch (e) {
			log('An error occured while deploying, try again');
			log('');
			log(e);
		}
	}
}
