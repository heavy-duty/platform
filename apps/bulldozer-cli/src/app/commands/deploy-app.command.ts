import { Command, CommandRunner } from 'nest-commander';

@Command({
	name: 'deploy-app',
	description:
		'Generate the source code for a specific App in a Workspace, build and deploy them using Anchor Build command under the hood. You need to pass two arguments, one to specify the workspace id in which you have the app you want to deploy. The other argument is the app id, to select it',
	arguments: '<workspace-id> <application-id>',
	argsDescription: {
		'workspace-id': 'The workspace id which you want to select',
		'application-id': 'The App id which you want to select ',
	},
})
export class GenerateAppCommand implements CommandRunner {
	async run(params: string[]) {
		console.log(`Workspace ID: ${params[0]} App Id: ${params[1]}`);
	}
}
