import { PublicKey } from '@solana/web3.js';
import { exec } from 'child_process';
import path from 'path';
import { log } from './log';

export const anchorDeploy = (): Promise<string> => {
	return new Promise((resolve, reject) => {
		exec('ls -la', (error, stdout, stderr) => {
			if (error) {
				log(`error: ${error.message}`);
				reject(error);
			}
			if (stderr) {
				log(`stderr: ${stderr}`);
				reject(stderr);
			}
			resolve(stdout);
		});
	});
};

export const generateCode = (
	outDir: string,
	workspaceName: string,
	workspacePubKey: PublicKey
): string => {
	// _generateWorkspaceCommand.run([
	// 	workspacePubKey.toBase58(),
	// 	`${outDir}/${formatName(workspace.name).snakeCase}/programs`,
	// 	applicationsProgramKeypairs[index].publicKey.toBase58(),
	// ]);
	return path.join(outDir, 'name_of_workspace');
};
