import { Command, CommandRunner } from 'nest-commander';

@Command({
	name: 'generate-app',
	description: ' Generate the source code for a specific App in a Workspace',
	arguments: '<workspace-id> <application-id>',
})
export class CreateBoardCommand implements CommandRunner {
	async run(params: string[]) {
		console.log(`Workspace ID: ${params[0]} App Id: ${params[1]}`);
	}
}
