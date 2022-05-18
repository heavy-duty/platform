import { Command, CommandRunner } from 'nest-commander';

@Command({
	name: 'deploy-workspace',
	description:
		'Generate the source code for all the Apps in a Workspace, build and deploy them using Anchor Build command under the hood. You need to pass two arguments, one to specify the workspace id in which you have the apps you want to deploy.',
	arguments: '<workspace-id>',
	argsDescription: {
		'workspace-id': '(public key) The workspace id which you want to select',
	},
})
export class DeployWorkspaceCommand implements CommandRunner {
	async run(params: string[]) {
		console.log(`Workspace ID: ${params[0]}`);
	}
}
