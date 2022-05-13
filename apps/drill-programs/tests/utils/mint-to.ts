import { AnchorProvider } from '@heavy-duty/anchor';
import { createMintToInstruction } from '@solana/spl-token';
import { PublicKey, Transaction } from '@solana/web3.js';

export const mintTo = async (
	provider: AnchorProvider,
	mint: PublicKey,
	amount: number | bigint,
	userAssociatedTokenAccount: PublicKey
) => {
	await provider.sendAndConfirm(
		new Transaction().add(
			createMintToInstruction(
				mint,
				userAssociatedTokenAccount,
				provider.wallet.publicKey,
				amount
			)
		)
	);
};
