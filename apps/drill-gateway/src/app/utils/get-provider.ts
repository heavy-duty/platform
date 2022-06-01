import { AnchorProvider, Wallet } from '@heavy-duty/anchor';
import { Connection, Keypair } from '@solana/web3.js';
import { SolanaConfig } from './get-solana-config';

export const getProvider = async (
	config: SolanaConfig
): Promise<AnchorProvider> => {
	const secretKey = JSON.parse(process.env.SOLANA_SECRET_KEY);
	const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
	const connection = new Connection(config.rpcUrl, config.commitment);
	const wallet = new Wallet(keypair);
	return new AnchorProvider(
		connection,
		wallet,
		AnchorProvider.defaultOptions()
	);
};
