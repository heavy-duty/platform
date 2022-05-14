import { AnchorProvider, Wallet } from '@heavy-duty/anchor';
import { Connection, Keypair } from '@solana/web3.js';
import { promises as fs } from 'fs';
import { SolanaConfig } from './get-solana-config';

export const getProvider = async (
	config: SolanaConfig
): Promise<AnchorProvider> => {
	const secretKey = JSON.parse(await fs.readFile(config.keypairPath, 'utf-8'));
	const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
	const connection = new Connection(config.rpcUrl, {
		commitment: config.commitment,
		confirmTransactionInitialTimeout: 120_000, // timeout for 2 minutes ~blockhash duration
	});
	const wallet = new Wallet(keypair);
	return new AnchorProvider(
		connection,
		wallet,
		AnchorProvider.defaultOptions()
	);
};
