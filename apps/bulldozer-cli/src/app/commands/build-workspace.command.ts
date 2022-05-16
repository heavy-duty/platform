import { Command, CommandRunner } from 'nest-commander';

@Command({
	name: 'build-workspace',
	description:
		' Generate the source code for a specific App in a Workspace and build it using Anchor Build command under the hood. You need to pass only one argument to specify the workspace id in which you have the apps you want to generate the source code and build into a binary.',
	arguments: '<workspace-id>',
	argsDescription: {
		'workspace-id': 'The workspace id which you want to select',
	},
})
export class GenerateAppCommand implements CommandRunner {
	async run(params: string[]) {
		console.log(`Workspace ID: ${params[0]}`);
	}
}
