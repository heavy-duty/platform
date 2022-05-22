import { Commitment } from '@solana/web3.js';

export interface SolanaConfig {
	rpcUrl: string;
	commitment: Commitment;
}

export const getSolanaConfig = async (): Promise<SolanaConfig> => {
	return {
		rpcUrl: process.env.RPC_URL,
		commitment: process.env.COMMITMENT as Commitment,
	};
};
