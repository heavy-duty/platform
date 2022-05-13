import { AnchorProvider, web3 } from '@heavy-duty/anchor';

export const createFundedWallet = async (
	provider: AnchorProvider,
	amount = 5
): Promise<web3.Keypair> => {
	const user = new web3.Keypair();

	await provider.sendAndConfirm(
		new web3.Transaction().add(
			web3.SystemProgram.transfer({
				fromPubkey: provider.wallet.publicKey,
				toPubkey: user.publicKey,
				lamports: amount * web3.LAMPORTS_PER_SOL,
			})
		)
	);

	return user;
};
