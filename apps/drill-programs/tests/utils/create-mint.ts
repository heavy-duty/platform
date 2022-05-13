import { AnchorProvider, web3 } from '@heavy-duty/anchor';
import {
	createInitializeMintInstruction,
	MintLayout,
	TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

export const createMint = async (
	provider: AnchorProvider,
	decimals = 6
): Promise<web3.PublicKey> => {
	const tokenMint = new web3.Keypair();
	const lamportsForMint =
		await provider.connection.getMinimumBalanceForRentExemption(
			MintLayout.span
		);

	await provider.sendAndConfirm(
		new web3.Transaction()
			.add(
				web3.SystemProgram.createAccount({
					programId: TOKEN_PROGRAM_ID,
					space: MintLayout.span,
					fromPubkey: provider.wallet.publicKey,
					newAccountPubkey: tokenMint.publicKey,
					lamports: lamportsForMint,
				})
			)
			.add(
				createInitializeMintInstruction(
					tokenMint.publicKey,
					decimals,
					provider.wallet.publicKey,
					provider.wallet.publicKey
				)
			),
		[tokenMint]
	);
	return tokenMint.publicKey;
};
