import { Command, CommandRunner } from 'nest-commander';

@Command({
	name: 'generate-workspace',
	description:
		'Generate the source code for all the Apps in a Workspace. You need to pass two arguments, one to specify the workspace id in which you have the app you want to generate the source code. The other argument is the app id, to select the app',
	arguments: '<workspace-id>',
	argsDescription: {
		'workspace-id': 'The workspace id which you want to select',
	},
})
export class GenerateWorkspaceCommand implements CommandRunner {
	async run(params: string[]) {
		console.log(`Workspace ID: ${params[0]}`);
	}
}
