import { PublicKey } from '@solana/web3.js';
import { writeFile } from 'fs/promises';
import { Command, CommandRunner } from 'nest-commander';
import { ApplicationCodeGenerator } from '../generators';
import { getApplication, getInstructions } from '../state';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';

@Command({
	name: 'generate-application',
	description:
		'Generate the source code for a specific App in a Workspace. You need to pass two arguments, one to specify the workspace id in which you have the app you want to generate the source code. The other argument is the app id, to select the app ',
	arguments: '<application-id> <out-file> <program-id>',
	argsDescription: {
		'application-id': '(public key) The App id which you want to select ',
		'out-file': '(path) The path where the app will be generated',
		'program-id': '(public key) The program id for the app',
	},
})
export class GenerateApplicationCommand implements CommandRunner {
	async run(params: string[]) {
		try {
			const [applicationId, outFile, programId] = params;
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			log(`Getting application data: ${applicationId}`);

			const application = await getApplication(
				program,
				new PublicKey(applicationId)
			);

			if (application === null) {
				throw new Error('Instruction not found');
			}

			const applicationInstructions =
				application.quantityOfInstructions > 0
					? await getInstructions(program, {
							application: application.publicKey.toBase58(),
					  })
					: [];

			writeFile(
				outFile,
				ApplicationCodeGenerator.generate(
					application,
					applicationInstructions,
					programId
				)
			);
		} catch (error) {
			log(error);
		}
	}
}
