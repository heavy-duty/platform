import { TransactionSignature } from '@solana/web3.js';

export const getExplorerUrl = (
	type: string,
	signature: TransactionSignature,
	cluster: string,
	rpcEndpoint: string
) => {
	const explorerUrl = new URL(
		`https://explorer.solana.com/${type}/${signature}`
	);

	explorerUrl.searchParams.append('cluster', cluster);

	if (cluster === 'custom') {
		explorerUrl.searchParams.append('customUrl', rpcEndpoint);
	}

	return explorerUrl.toString();
};
