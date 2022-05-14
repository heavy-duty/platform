import { AnchorProvider, Program } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';
import { Drill, IDL } from './drill';

export const getProgram = (
	programId: PublicKey,
	provider: AnchorProvider
): Program<Drill> => {
	return new Program<Drill>(IDL, programId, provider);
};
