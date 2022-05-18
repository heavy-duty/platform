import { Command, CommandRunner } from 'nest-commander';

@Command({
	name: 'build-app',
	description:
		'Generate the source code for a specific App in a Workspace and build it using Anchor Build command under the hood. You need to pass two arguments, one to specify the workspace id in which you have the app you want to generate the source code and build into a binary. The other argument is the app id, to select it',
	arguments: '<workspace-id> <application-id>',
	argsDescription: {
		'workspace-id': '(public key) The workspace id which you want to select',
		'application-id': '(public key) The App id which you want to select ',
	},
})
export class BuildAppCommand implements CommandRunner {
	async run(params: string[]) {
		console.log(`Workspace ID: ${params[0]} App Id: ${params[1]}`);
	}
}
