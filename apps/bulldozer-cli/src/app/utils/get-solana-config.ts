import { Commitment } from '@solana/web3.js';
import { exec } from 'child_process';
import * as util from 'util';
const execPromise = util.promisify(exec);

export interface SolanaConfig {
	configFile: string;
	rpcUrl: string;
	keypairPath: string;
	commitment: Commitment;
}

export const getSolanaConfig = async (): Promise<SolanaConfig> => {
	const config = await execPromise('solana config get');

	const [configFile, rpcUrl, , keypairPath, commitment] =
		config.stdout.split('\n');

	return {
		configFile: configFile.split('Config File: ')[1].trim(),
		rpcUrl: rpcUrl.split('RPC URL: ')[1].trim(),
		keypairPath: keypairPath.split('Keypair Path: ')[1].trim(),
		commitment: commitment.split('Commitment: ')[1].trim() as Commitment,
	};
};
