import { Command, CommandRunner } from 'nest-commander';

@Command({
	name: 'generate-app',
	description:
		'Generate the source code for a specific App in a Workspace. You need to pass two arguments, one to specify the workspace id in which you have the app you want to generate the source code. The other argument is the app id, to select the app ',
	arguments: '<workspace-id> <application-id>',
	argsDescription: {
		'workspace-id': '(public key) The workspace id which you want to select',
		'application-id': '(public key) The App id which you want to select ',
	},
})
export class GenerateAppCommand implements CommandRunner {
	async run(params: string[]) {
		console.log(`Workspace ID: ${params[0]} App Id: ${params[1]}`);
	}
}
