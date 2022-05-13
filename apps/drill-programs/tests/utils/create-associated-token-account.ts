import { AnchorProvider } from '@heavy-duty/anchor';
import {
	createAssociatedTokenAccountInstruction,
	getAssociatedTokenAddress,
} from '@solana/spl-token';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';

export const createAssociatedTokenAccount = async (
	provider: AnchorProvider,
	mint: PublicKey,
	user: Keypair
): Promise<PublicKey | undefined> => {
	const userAssociatedTokenAccount = await getAssociatedTokenAddress(
		mint,
		user.publicKey
	);

	await provider.sendAndConfirm(
		new Transaction().add(
			createAssociatedTokenAccountInstruction(
				user.publicKey,
				userAssociatedTokenAccount,
				user.publicKey,
				mint
			)
		),
		[user]
	);

	return userAssociatedTokenAccount;
};
